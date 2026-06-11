import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import {
  BaseStockUnit,
  InventoryMovementType,
  MovementDirection,
  PaymentStatus,
  ProductFamily,
  Prisma,
  SupplierOrderStatus,
  SupplierOrderItemStatus,
  TransactionUnit,
} from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateSupplierDto } from './dto/create-supplier.dto'
import { UpdateSupplierDto } from './dto/update-supplier.dto'
import { CreateSupplierOrderDto } from './dto/create-supplier-order.dto'
import { ReceiveSupplierOrderDto } from './dto/receive-supplier-order.dto'
import { RegisterSupplierPaymentDto } from './dto/register-supplier-payment.dto'

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────
  // SUPPLIERS
  // ─────────────────────────────────────────────────────────────
  async createSupplier(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: {
        name: dto.name.trim(),
        contactName: dto.contactName?.trim(),
        phone: dto.phone?.trim(),
        address: dto.address?.trim(),
        notes: dto.notes?.trim(),
      },
    })
  }

  async findOrdersBySupplier(supplierId: string) {
  await this.findSupplierById(supplierId) // valida que exista

  return this.prisma.supplierOrder.findMany({
    where: { supplierId },
    orderBy: { orderedAt: 'desc' },
    include: {
      supplier: true,
      items: {
        include: { product: true },
      },
      payments: true,
      createdBy: true,
    },
  })
}


  async findAllSuppliers() {
    return this.prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    })
  }

  async findSupplierById(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { orderedAt: 'desc' },
        },
      },
    })

    if (!supplier) {
      throw new NotFoundException('Proveedor no encontrado')
    }

    return supplier
  }

  async updateSupplier(id: string, dto: UpdateSupplierDto) {
    await this.findSupplierById(id)

    return this.prisma.supplier.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        contactName: dto.contactName?.trim(),
        phone: dto.phone?.trim(),
        address: dto.address?.trim(),
        notes: dto.notes?.trim(),
      },
    })
  }

  async deleteSupplier(id: string) {
    await this.findSupplierById(id)

    return this.prisma.supplier.delete({
      where: { id },
    })
  }

  // ─────────────────────────────────────────────────────────────
  // SUPPLIER ORDERS
  // ─────────────────────────────────────────────────────────────
  async createSupplierOrder(dto: CreateSupplierOrderDto, createdByUserId: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Debes agregar al menos un item al pedido')
    }

    const supplier = await this.prisma.supplier.findUnique({
      where: { id: dto.supplierId },
    })

    if (!supplier) {
      throw new NotFoundException('Proveedor no encontrado')
    }

    const productIds = dto.items.map((item) => item.productId)
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        family: true,
        baseStockUnit: true,
        unitsPerPack: true,
        isActive: true,
      },
    })

    if (products.length !== productIds.length) {
      throw new BadRequestException('Uno o más productos no existen')
    }

    const productsMap = new Map(products.map((product) => [product.id, product]))

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.supplierOrder.create({
        data: {
          supplierId: dto.supplierId,
          expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : null,
          notes: dto.notes?.trim(),
          createdByUserId,
          status: SupplierOrderStatus.ORDERED,
          paymentStatus: PaymentStatus.UNPAID,
          orderedTotalEstimated: new Prisma.Decimal(0),
          receivedTotalActual: new Prisma.Decimal(0),
          amountPaid: new Prisma.Decimal(0),
          balanceDue: new Prisma.Decimal(0),
        },
      })

      let orderedTotalEstimated = new Prisma.Decimal(0)

      for (const item of dto.items) {
        const product = productsMap.get(item.productId)
        if (!product) {
          throw new BadRequestException('Producto no válido en el pedido')
        }

        const orderedBaseQuantity = this.toBaseQuantity(
          {
            baseStockUnit: product.baseStockUnit,
            family: product.family,
            unitsPerPack: product.unitsPerPack,
          },
          item.orderedUnit,
          item.orderedQuantity,
        )

        const lineTotal = new Prisma.Decimal(orderedBaseQuantity).mul(item.quotedUnitCost)
        orderedTotalEstimated = orderedTotalEstimated.add(lineTotal)

        await tx.supplierOrderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            orderedUnit: item.orderedUnit,
            orderedQuantity: new Prisma.Decimal(item.orderedQuantity),
            orderedBaseQuantity,
            quotedUnitCost: new Prisma.Decimal(item.quotedUnitCost),
            receivedBaseQuantity: 0,
            lineStatus: SupplierOrderItemStatus.PENDING,
          },
        })
      }

      const updatedOrder = await tx.supplierOrder.update({
        where: { id: order.id },
        data: {
          orderedTotalEstimated,
          balanceDue: orderedTotalEstimated,
        },
        include: {
          supplier: true,
          items: {
            include: { product: true },
          },
          payments: true,
          createdBy: true,
        },
      })

      return updatedOrder
    })
  }

  async findAllSupplierOrders() {
    return this.prisma.supplierOrder.findMany({
      orderBy: { orderedAt: 'desc' },
      include: {
        supplier: true,
        items: {
          include: { product: true },
        },
        payments: true,
        createdBy: true,
      },
    })
  }

  async findSupplierOrderById(id: string) {
    const order = await this.prisma.supplierOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: { product: true },
        },
        payments: true,
        createdBy: true,
      },
    })

    if (!order) {
      throw new NotFoundException('Pedido no encontrado')
    }

    return order
  }

  async receiveSupplierOrder(
    orderId: string,
    dto: ReceiveSupplierOrderDto,
    receivedByUserId: string,
  ) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Debes enviar al menos un item recibido')
    }

    const order = await this.prisma.supplierOrder.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
      },
    })

    if (!order) {
      throw new NotFoundException('Pedido no encontrado')
    }

    if (order.status === SupplierOrderStatus.CANCELLED) {
      throw new BadRequestException('No se puede recibir un pedido cancelado')
    }

    const itemMap = new Map(order.items.map((item) => [item.id, item]))

    return this.prisma.$transaction(async (tx) => {
      let receivedDeltaTotal = new Prisma.Decimal(0)

      for (const receivedItem of dto.items) {
        const orderItem = itemMap.get(receivedItem.orderItemId)

        if (!orderItem) {
          throw new BadRequestException('Uno de los items recibidos no pertenece al pedido')
        }

        const incomingBaseQuantity = this.toBaseQuantity(
          {
            baseStockUnit: orderItem.product.baseStockUnit,
            family: orderItem.product.family,
            unitsPerPack: orderItem.product.unitsPerPack,
          },
          receivedItem.receivedUnit,
          receivedItem.receivedQuantity,
        )

        const currentReceived = orderItem.receivedBaseQuantity
        const nextReceived = currentReceived + incomingBaseQuantity

        if (nextReceived > orderItem.orderedBaseQuantity) {
          throw new BadRequestException(
            `La recepción del producto ${orderItem.product.name} supera la cantidad pedida`,
          )
        }

        const incomingCost = new Prisma.Decimal(receivedItem.receivedUnitCost)
        const incomingLineTotal = new Prisma.Decimal(incomingBaseQuantity).mul(incomingCost)
        receivedDeltaTotal = receivedDeltaTotal.add(incomingLineTotal)

        const stock = await tx.stock.findUnique({
          where: { productId: orderItem.productId },
        })

        const currentOnHand = stock?.onHand ?? 0
        const currentAvg = stock ? new Prisma.Decimal(stock.averageUnitCost) : new Prisma.Decimal(0)

        const newOnHand = currentOnHand + incomingBaseQuantity

        const newAvgCost = stock
          ? new Prisma.Decimal(currentOnHand).mul(currentAvg)
              .add(new Prisma.Decimal(incomingBaseQuantity).mul(incomingCost))
              .div(newOnHand)
          : incomingCost

        await tx.stock.upsert({
          where: { productId: orderItem.productId },
          update: {
            onHand: newOnHand,
            averageUnitCost: newAvgCost,
          },
          create: {
            productId: orderItem.productId,
            onHand: newOnHand,
            averageUnitCost: newAvgCost,
          },
        })

        await tx.inventoryMovement.create({
          data: {
            productId: orderItem.productId,
            type: InventoryMovementType.PURCHASE_RECEIPT,
            direction: MovementDirection.IN,
            quantity: incomingBaseQuantity,
            stockAfter: newOnHand,
            unitCostSnapshot: incomingCost,
            sourceType: 'SUPPLIER_ORDER',
            sourceId: order.id,
            note: dto.notes?.trim(),
            occurredAt: dto.receivedAt ? new Date(dto.receivedAt) : new Date(),
            createdByUserId: receivedByUserId,
          },
        })

        await tx.supplierOrderItem.update({
          where: { id: orderItem.id },
          data: {
            receivedUnit: receivedItem.receivedUnit,
            receivedQuantity: new Prisma.Decimal(receivedItem.receivedQuantity),
            receivedBaseQuantity: nextReceived,
            receivedUnitCost: incomingCost,
            lineStatus:
              nextReceived === orderItem.orderedBaseQuantity
                ? SupplierOrderItemStatus.RECEIVED
                : SupplierOrderItemStatus.PARTIAL,
          },
        })
      }

      const updatedOrder = await tx.supplierOrder.findUnique({
        where: { id: order.id },
        include: {
          items: true,
        },
      })

      if (!updatedOrder) {
        throw new NotFoundException('Pedido no encontrado luego de la recepción')
      }

      const allItemsReceived = updatedOrder.items.every(
        (item) => item.receivedBaseQuantity >= item.orderedBaseQuantity,
      )

      const newReceivedTotal = order.receivedTotalActual.add(receivedDeltaTotal)
      const newBalanceDue = newReceivedTotal.sub(order.amountPaid)

      const finalBalanceDue =
        Number(newBalanceDue) > 0 ? newBalanceDue : new Prisma.Decimal(0)

      const paymentStatus =
        Number(finalBalanceDue) <= 0
          ? PaymentStatus.PAID
          : Number(order.amountPaid) > 0
            ? PaymentStatus.PARTIAL
            : PaymentStatus.UNPAID

      return tx.supplierOrder.update({
        where: { id: order.id },
        data: {
          receivedTotalActual: newReceivedTotal,
          balanceDue: finalBalanceDue,
          status: allItemsReceived
            ? SupplierOrderStatus.RECEIVED
            : SupplierOrderStatus.PARTIALLY_RECEIVED,
          paymentStatus,
        },
        include: {
          supplier: true,
          items: {
            include: { product: true },
          },
          payments: true,
          createdBy: true,
        },
      })
    })
  }

  async registerSupplierPayment(
    orderId: string,
    dto: RegisterSupplierPaymentDto,
    registeredByUserId: string,
  ) {
    const order = await this.prisma.supplierOrder.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      throw new NotFoundException('Pedido no encontrado')
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.supplierPayment.create({
        data: {
          orderId,
          amount: new Prisma.Decimal(dto.amount),
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
          method: dto.method,
          reference: dto.reference?.trim(),
          notes: dto.notes?.trim(),
          registeredByUserId,
        },
      })

      const amountPaid = order.amountPaid.add(payment.amount)
      const basis = order.receivedTotalActual
        && Number(order.receivedTotalActual) > 0
          ? order.receivedTotalActual
          : order.orderedTotalEstimated

      const balanceDueRaw = basis.sub(amountPaid)
      const balanceDue =
        Number(balanceDueRaw) > 0 ? balanceDueRaw : new Prisma.Decimal(0)

      const paymentStatus =
        Number(balanceDue) <= 0
          ? PaymentStatus.PAID
          : Number(amountPaid) > 0
            ? PaymentStatus.PARTIAL
            : PaymentStatus.UNPAID

      await tx.supplierOrder.update({
        where: { id: orderId },
        data: {
          amountPaid,
          balanceDue,
          paymentStatus,
        },
      })

      return payment
    })
  }

  async findSupplierPayments(orderId: string) {
    return this.prisma.supplierPayment.findMany({
      where: { orderId },
      orderBy: { paymentDate: 'desc' },
    })
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────
  private toBaseQuantity(
    product: {
      baseStockUnit: BaseStockUnit
      family: ProductFamily
      unitsPerPack: number | null
    },
    unit: TransactionUnit,
    quantity: number,
  ) {
    if (product.baseStockUnit === BaseStockUnit.PACK) {
      if (unit !== TransactionUnit.PACK) {
        throw new BadRequestException('Los productos embalados solo pueden manejarse en packs')
      }

      return quantity
    }

    if (unit === TransactionUnit.GROUP) return quantity * 300
    if (unit === TransactionUnit.MAPLE) return quantity * 30
    if (unit === TransactionUnit.UNIT) return quantity

    throw new BadRequestException('La unidad seleccionada no es válida para este producto')
  }
}