import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import {
  InventoryMovementType,
  MovementDirection,
  Prisma,
  WholesaleSaleStatus,
} from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateWholesaleSaleDto } from './dto/create-wholesale-sale.dto'
import { RegisterPaymentDto } from './dto/register-payment.dto'
import { QueryWholesaleSalesDto } from './dto/query-wholesale-sales.dto'
import { toBaseQuantity } from './utils/units.util'

@Injectable()
export class WholesaleSalesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────
  // CLIENTES ACTIVOS — para el selector de ventas
  // ─────────────────────────────────────────────────────────────
  async getActiveCustomers() {
    const customers = await this.prisma.wholesaleCustomer.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { businessName: 'asc' },
      select: {
        id: true,
        code: true,
        businessName: true,
        contactName: true,
        phone: true,
        creditLimit: true,
        sales: {
          where: { status: { not: WholesaleSaleStatus.CANCELLED } },
          select: { balanceDue: true, saleDate: true, status: true },
          orderBy: { saleDate: 'desc' },
          take: 1,
        },
      },
    })

    return customers.map((c) => {
      const lastSale = c.sales[0] ?? null
      const totalDebt = c.sales.reduce(
        (acc, s) => acc + Number(s.balanceDue),
        0,
      )
      return {
        id: c.id,
        code: c.code,
        businessName: c.businessName,
        contactName: c.contactName,
        phone: c.phone,
        creditLimit: c.creditLimit,
        totalDebt,
        lastSaleDate: lastSale?.saleDate ?? null,
        lastSaleStatus: lastSale?.status ?? null,
      }
    })
  }

  // ─────────────────────────────────────────────────────────────
  // LISTA DE VENTAS — con filtros y paginación
  // ─────────────────────────────────────────────────────────────
  async findAll(query: QueryWholesaleSalesDto) {
    const { customerId, status, page = 1, limit = 20 } = query
    const skip = (page - 1) * limit

    const where: Prisma.WholesaleSaleWhereInput = {
      ...(customerId && { customerId }),
      ...(status && { status }),
    }

    const [sales, total] = await Promise.all([
      this.prisma.wholesaleSale.findMany({
        where,
        orderBy: { saleDate: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          saleDate: true,
          status: true,
          subtotal: true,
          amountPaid: true,
          balanceDue: true,
          notes: true,
          createdAt: true,
          customer: {
            select: { id: true, code: true, businessName: true, phone: true },
          },
          createdBy: {
            select: { id: true, name: true },
          },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.wholesaleSale.count({ where }),
    ])

    return {
      data: sales,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DETALLE DE UNA VENTA
  // ─────────────────────────────────────────────────────────────
  async findOne(id: string) {
    const sale = await this.prisma.wholesaleSale.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            code: true,
            businessName: true,
            contactName: true,
            phone: true,
          },
        },
        createdBy: { select: { id: true, name: true } },
        items: {
          include: {
            product: {
              select: { id: true, sku: true, name: true, family: true },
            },
          },
        },
        paymentAllocations: {
          include: {
            payment: {
              select: {
                id: true,
                amount: true,
                paymentDate: true,
                method: true,
                reference: true,
                registeredBy: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    })

    if (!sale) throw new NotFoundException('Venta no encontrada')
    return sale
  }

  // ─────────────────────────────────────────────────────────────
  // CREAR VENTA — descuenta stock y registra movimientos
  // ─────────────────────────────────────────────────────────────
  async create(dto: CreateWholesaleSaleDto, userId: string) {
    // 1. Validar cliente
    const customer = await this.prisma.wholesaleCustomer.findFirst({
      where: { id: dto.customerId, isActive: true, deletedAt: null },
    })
    if (!customer) throw new NotFoundException('Cliente no encontrado o inactivo')

    // 2. Cargar productos y stock
    const productIds = dto.items.map((i) => i.productId)
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { stock: true },
    })

    if (products.length !== productIds.length) {
      throw new BadRequestException(
        'Uno o más productos no existen o están inactivos',
      )
    }

    const productMap = new Map(products.map((p) => [p.id, p]))

    // 3. Calcular items y validar stock
    type ItemCalc = {
      productId: string
      saleUnit: any
      quantity: number
      baseQuantity: number
      unitPrice: Prisma.Decimal
      estimatedUnitCost: Prisma.Decimal
      subtotal: Prisma.Decimal
      estimatedProfit: Prisma.Decimal
      notes?: string
    }

    const itemsCalc: ItemCalc[] = []
    let subtotalTotal = new Prisma.Decimal(0)
    let estimatedCostTotal = new Prisma.Decimal(0)

    for (const item of dto.items) {
      const product = productMap.get(item.productId)!
      const currentOnHand = product.stock?.onHand ?? 0
      const avgCost = product.stock?.averageUnitCost ?? new Prisma.Decimal(0)

      const baseQty = toBaseQuantity(
        item.quantity,
        item.saleUnit,
        product.family,
        product.baseStockUnit,
        product.unitsPerPack,
      )

      if (baseQty > currentOnHand) {
        throw new BadRequestException(
          `Stock insuficiente para "${product.name}". Disponible: ${currentOnHand}, solicitado: ${baseQty}`,
        )
      }

      const unitPrice = new Prisma.Decimal(item.unitPrice)
      // El precio unitario es por unidad base
      const subtotal = unitPrice.mul(baseQty)
      const estimatedCost = avgCost.mul(baseQty)
      const estimatedProfit = subtotal.sub(estimatedCost)

      itemsCalc.push({
        productId: item.productId,
        saleUnit: item.saleUnit,
        quantity: item.quantity,
        baseQuantity: baseQty,
        unitPrice,
        estimatedUnitCost: avgCost,
        subtotal,
        estimatedProfit,
        notes: item.notes,
      })

      subtotalTotal = subtotalTotal.add(subtotal)
      estimatedCostTotal = estimatedCostTotal.add(estimatedCost)
    }

    // 4. Validar pago inicial
    const initialPayment = dto.initialPayment
      ? new Prisma.Decimal(dto.initialPayment)
      : new Prisma.Decimal(0)

    if (initialPayment.gt(subtotalTotal)) {
      throw new BadRequestException(
        `El pago inicial (${initialPayment}) no puede superar el total (${subtotalTotal})`,
      )
    }

    const balanceDue = subtotalTotal.sub(initialPayment)
    const estimatedProfitTotal = subtotalTotal.sub(estimatedCostTotal)

    const saleStatus: WholesaleSaleStatus =
      balanceDue.eq(0)
        ? WholesaleSaleStatus.PAID
        : initialPayment.gt(0)
        ? WholesaleSaleStatus.PARTIAL
        : WholesaleSaleStatus.PENDING

    // 5. Todo en una transacción
    return this.prisma.$transaction(async (tx) => {
      // Crear la venta
      const sale = await tx.wholesaleSale.create({
        data: {
          customerId: dto.customerId,
          status: saleStatus,
          subtotal: subtotalTotal,
          amountPaid: initialPayment,
          balanceDue,
          estimatedCostTotal,
          estimatedProfitTotal,
          notes: dto.notes,
          createdByUserId: userId,
          items: {
            create: itemsCalc.map((i) => ({
              productId: i.productId,
              saleUnit: i.saleUnit,
              quantity: i.quantity,
              baseQuantity: i.baseQuantity,
              unitPrice: i.unitPrice,
              estimatedUnitCost: i.estimatedUnitCost,
              subtotal: i.subtotal,
              estimatedProfit: i.estimatedProfit,
              notes: i.notes,
            })),
          },
        },
        include: {
          items: true,
          customer: { select: { id: true, code: true, businessName: true } },
        },
      })

      // Descontar stock y registrar movimientos por cada item
      for (const item of itemsCalc) {
        const product = productMap.get(item.productId)!
        const currentOnHand = product.stock?.onHand ?? 0
        const newOnHand = currentOnHand - item.baseQuantity

        await tx.stock.upsert({
          where: { productId: item.productId },
          update: { onHand: newOnHand },
          create: {
            productId: item.productId,
            onHand: newOnHand,
            averageUnitCost: new Prisma.Decimal(0),
          },
        })

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: InventoryMovementType.WHOLESALE_SALE,
            direction: MovementDirection.OUT,
            quantity: item.baseQuantity,
            stockAfter: newOnHand,
            unitCostSnapshot: item.estimatedUnitCost,
            unitPriceSnapshot: item.unitPrice,
            sourceType: 'WHOLESALE_SALE',
            sourceId: sale.id,
            note: `Venta mayorista — ${customer.businessName}`,
            occurredAt: new Date(),
            createdByUserId: userId,
          },
        })
      }

      // Registrar pago inicial si existe
      if (initialPayment.gt(0)) {
        const payment = await tx.wholesalePayment.create({
          data: {
            customerId: dto.customerId,
            amount: initialPayment,
            method: dto.paymentMethod!,
            reference: dto.paymentReference,
            notes: 'Pago al momento de la venta',
            registeredByUserId: userId,
          },
        })

        await tx.wholesalePaymentAllocation.create({
          data: {
            paymentId: payment.id,
            saleId: sale.id,
            amount: initialPayment,
          },
        })
      }

      return sale
    })
  }

  // ─────────────────────────────────────────────────────────────
  // REGISTRAR PAGO POSTERIOR
  // ─────────────────────────────────────────────────────────────
  async registerPayment(saleId: string, dto: RegisterPaymentDto, userId: string) {
    const sale = await this.prisma.wholesaleSale.findUnique({
      where: { id: saleId },
    })

    if (!sale) throw new NotFoundException('Venta no encontrada')
    if (sale.status === WholesaleSaleStatus.PAID) {
      throw new BadRequestException('Esta venta ya está completamente pagada')
    }
    if (sale.status === WholesaleSaleStatus.CANCELLED) {
      throw new BadRequestException('No se puede registrar pago en una venta cancelada')
    }

    const amount = new Prisma.Decimal(dto.amount)
    const currentBalance = new Prisma.Decimal(sale.balanceDue)

    if (amount.gt(currentBalance)) {
      throw new BadRequestException(
        `El monto (${amount}) supera el saldo pendiente (${currentBalance})`,
      )
    }

    const newAmountPaid = new Prisma.Decimal(sale.amountPaid).add(amount)
    const newBalanceDue = currentBalance.sub(amount)

    const newStatus: WholesaleSaleStatus = newBalanceDue.eq(0)
      ? WholesaleSaleStatus.PAID
      : WholesaleSaleStatus.PARTIAL

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.wholesalePayment.create({
        data: {
          customerId: sale.customerId,
          amount,
          method: dto.method,
          reference: dto.reference,
          notes: dto.notes,
          registeredByUserId: userId,
        },
      })

      await tx.wholesalePaymentAllocation.create({
        data: {
          paymentId: payment.id,
          saleId,
          amount,
        },
      })

      const updated = await tx.wholesaleSale.update({
        where: { id: saleId },
        data: {
          amountPaid: newAmountPaid,
          balanceDue: newBalanceDue,
          status: newStatus,
        },
        include: {
          customer: { select: { id: true, code: true, businessName: true } },
        },
      })

      return { sale: updated, payment }
    })
  }

  // ─────────────────────────────────────────────────────────────
  // CANCELAR VENTA — devuelve stock
  // ─────────────────────────────────────────────────────────────
  async cancel(saleId: string, userId: string) {
    const sale = await this.prisma.wholesaleSale.findUnique({
      where: { id: saleId },
      include: { items: true },
    })

    if (!sale) throw new NotFoundException('Venta no encontrada')
    if (sale.status === WholesaleSaleStatus.CANCELLED) {
      throw new BadRequestException('La venta ya está cancelada')
    }
    if (sale.status === WholesaleSaleStatus.PAID) {
      throw new BadRequestException(
        'No se puede cancelar una venta ya pagada. Contacta al administrador.',
      )
    }

    return this.prisma.$transaction(async (tx) => {
      // Devolver stock por cada item
      for (const item of sale.items) {
        const stock = await tx.stock.findUnique({
          where: { productId: item.productId },
        })
        const newOnHand = (stock?.onHand ?? 0) + item.baseQuantity

        await tx.stock.update({
          where: { productId: item.productId },
          data: { onHand: newOnHand },
        })

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: InventoryMovementType.RETURN_IN,
            direction: MovementDirection.IN,
            quantity: item.baseQuantity,
            stockAfter: newOnHand,
            sourceType: 'WHOLESALE_SALE',
            sourceId: saleId,
            note: 'Cancelación de venta mayorista',
            occurredAt: new Date(),
            createdByUserId: userId,
          },
        })
      }

      return tx.wholesaleSale.update({
        where: { id: saleId },
        data: { status: WholesaleSaleStatus.CANCELLED },
      })
    })
  }
}