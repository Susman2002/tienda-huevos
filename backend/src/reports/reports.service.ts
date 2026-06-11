import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import PDFKit from 'pdfkit'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit')

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getTopSellingProducts() {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const sales = await this.prisma.wholesaleSaleItem.groupBy({
      by: ['productId'],
      _sum: { baseQuantity: true, subtotal: true },
      where: {
        sale: {
          saleDate: { gte: sevenDaysAgo },
          status: { not: 'CANCELLED' },
        },
      },
      orderBy: { _sum: { baseQuantity: 'desc' } },
      take: 5,
    })

    const productIds = sales.map((item) => item.productId)
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true, family: true },
    })

    return sales.map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return {
        productId: item.productId,
        sku: product?.sku ?? 'SIN-SKU',
        name: product?.name ?? 'Producto desconocido',
        family: product?.family ?? null,
        totalUnits: item._sum.baseQuantity ?? 0,
        totalRevenue: Number(item._sum.subtotal ?? 0),
      }
    })
  }

  async generateSuppliersOrdersPdf(
    startDate?: string,
    endDate?: string,
  ): Promise<Buffer> {
    const where: { orderedAt?: { gte?: Date; lte?: Date } } = {}

    if (startDate || endDate) {
      where.orderedAt = {}
      if (startDate) where.orderedAt.gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.orderedAt.lte = end
      }
    }

    const orders = await this.prisma.supplierOrder.findMany({
      where,
      include: {
        supplier: true,
        items: { include: { product: true }, orderBy: { createdAt: 'asc' } },
        payments: {
          include: { registeredBy: { select: { name: true } } },
          orderBy: { paymentDate: 'asc' },
        },
        createdBy: { select: { name: true } },
      },
      orderBy: { orderedAt: 'desc' },
    })

    return new Promise((resolve, reject) => {
      const doc: PDFKit.PDFDocument = new PDFDocument({ margin: 40, size: 'A4' })
      const buffers: Buffer[] = []

      doc.on('data', (chunk: Buffer) => buffers.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', reject)

      // ── Encabezado ──────────────────────────────────────────────────────────
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('REPORTE DE PEDIDOS A PROVEEDORES', { align: 'center' })

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text(`Generado el: ${this.formatDateTime(new Date())}`, { align: 'center' })

      if (startDate || endDate) {
        doc.text(
          `Rango: ${startDate ? this.formatDate(new Date(startDate)) : 'Inicio'} — ${
            endDate ? this.formatDate(new Date(endDate)) : 'Hoy'
          }`,
          { align: 'center' },
        )
      }

      doc.fillColor('#000000').moveDown(1)

      if (orders.length === 0) {
        doc
          .fontSize(11)
          .fillColor('#6b7280')
          .text('No se encontraron pedidos para el rango seleccionado.', { align: 'center' })
        doc.end()
        return
      }

      orders.forEach((order, index) => {
        // ── Encabezado del pedido ──────────────────────────────────────────
        const headerY = doc.y
        doc
          .rect(doc.page.margins.left, headerY, doc.page.width - 80, 85)
          .fill('#f3f4f6')

        doc
          .fillColor('#111827')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(
            `Pedido #${index + 1}  —  ID: ${order.id.substring(0, 8)}`,
            doc.page.margins.left + 6,
            headerY + 5,
          )

        doc.font('Helvetica').fontSize(9)
        doc.text(`Proveedor: ${order.supplier.name}`, doc.page.margins.left + 6)
        doc.text(`Fecha: ${this.formatDate(order.orderedAt)}`, doc.page.margins.left + 6)
        doc.text(`Creado por: ${order.createdBy.name}`, doc.page.margins.left + 6)
        doc.text(`Estado pedido: ${order.status}`, doc.page.margins.left + 6)
        doc
          .fillColor(order.paymentStatus === 'PAID' ? '#16a34a' : '#dc2626')
          .text(`Estado pago: ${order.paymentStatus}`, doc.page.margins.left + 6)
          .fillColor('#111827')

        doc.moveDown(1)

        // ── Tabla productos ────────────────────────────────────────────────
        doc.font('Helvetica-Bold').fontSize(9).text('Productos del pedido:')
        doc.moveDown(0.3)

        this.drawTableHeader(doc, [
          { label: 'Producto', width: 155 },
          { label: 'Unid. pedida', width: 80 },
          { label: 'Cant. pedida', width: 80 },
          { label: 'Cant. recibida', width: 85 },
          { label: 'Costo recibido', width: 85 },
        ])

        order.items.forEach((item) => {
          this.drawTableRow(doc, [
            { value: item.product.name, width: 155 },
            { value: item.orderedUnit, width: 80 },
            { value: item.orderedQuantity.toString(), width: 80 },
            { value: item.receivedQuantity?.toString() ?? '0', width: 85 },
            { value: `Bs. ${Number(item.receivedUnitCost ?? 0).toFixed(2)}`, width: 85 },
          ])
        })

        doc.moveDown(0.8)

        // ── Tabla pagos ────────────────────────────────────────────────────
        doc.font('Helvetica-Bold').fontSize(9).text('Pagos registrados:')
        doc.moveDown(0.3)

        this.drawTableHeader(doc, [
          { label: 'Fecha', width: 85 },
          { label: 'Monto', width: 85 },
          { label: 'Método', width: 85 },
          { label: 'Referencia', width: 100 },
          { label: 'Registrado por', width: 130 },
        ])

        if (order.payments.length === 0) {
          doc
            .font('Helvetica')
            .fontSize(8)
            .fillColor('#6b7280')
            .text('Sin pagos registrados', { align: 'center' })
            .fillColor('#111827')
        } else {
          order.payments.forEach((payment) => {
            this.drawTableRow(doc, [
              { value: this.formatDate(payment.paymentDate), width: 85 },
              { value: `Bs. ${Number(payment.amount).toFixed(2)}`, width: 85 },
              { value: payment.method, width: 85 },
              { value: payment.reference ?? '-', width: 100 },
              { value: payment.registeredBy.name, width: 130 },
            ])
          })
        }

        doc.moveDown(0.8)

        // ── Totales ────────────────────────────────────────────────────────
        doc.font('Helvetica-Bold').fontSize(9)
        doc.text(`Total recibido: Bs. ${Number(order.receivedTotalActual).toFixed(2)}`, { align: 'right' })
        doc.text(`Pagado:         Bs. ${Number(order.amountPaid).toFixed(2)}`, { align: 'right' })
        doc.text(`Saldo:          Bs. ${Number(order.balanceDue).toFixed(2)}`, { align: 'right' })

        doc.moveDown(1.5)

        // ── Separador ─────────────────────────────────────────────────────
        if (index < orders.length - 1) {
          doc
            .moveTo(doc.page.margins.left, doc.y)
            .lineTo(doc.page.width - doc.page.margins.right, doc.y)
            .strokeColor('#d1d5db')
            .stroke()
          doc.moveDown(1)
        }
      })

      doc.end()
    })
  }

  // ─── Helpers tablas ────────────────────────────────────────────────────────
  private drawTableHeader(
    doc: PDFKit.PDFDocument,
    columns: { label: string; width: number }[],
  ) {
    const startX = doc.page.margins.left
    const startY = doc.y
    const rowHeight = 18
    const totalWidth = columns.reduce((a, c) => a + c.width, 0)

    doc.rect(startX, startY, totalWidth, rowHeight).fill('#1f2937')

    let x = startX
    doc.font('Helvetica-Bold').fontSize(8).fillColor('white')
    columns.forEach((col) => {
      doc.text(col.label, x + 4, startY + 5, { width: col.width - 8, lineBreak: false })
      x += col.width
    })

    doc.fillColor('#111827')
    doc.y = startY + rowHeight + 2
  }

  private drawTableRow(
    doc: PDFKit.PDFDocument,
    columns: { value: string; width: number }[],
  ) {
    const startX = doc.page.margins.left
    const startY = doc.y
    const rowHeight = 16
    const totalWidth = columns.reduce((a, c) => a + c.width, 0)

    let x = startX
    doc.font('Helvetica').fontSize(8).fillColor('#111827')
    columns.forEach((col) => {
      doc.text(col.value, x + 4, startY + 4, { width: col.width - 8, lineBreak: false })
      x += col.width
    })

    doc
      .moveTo(startX, startY + rowHeight)
      .lineTo(startX + totalWidth, startY + rowHeight)
      .strokeColor('#e5e7eb')
      .stroke()

    doc.y = startY + rowHeight + 2
  }

  // ─── Utilidades fecha ──────────────────────────────────────────────────────
  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  private formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
}