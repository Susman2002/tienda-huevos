import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import {
  InventoryMovementType,
  MovementDirection,
  Prisma,
  ProductFamily,
} from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { AdjustStockDto } from './dto/adjust-stock.dto'

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────
  // GET ALL STOCK — agrupado por familia, solo productos activos
  // ─────────────────────────────────────────────────────────────
  async findAll() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ family: 'asc' }, { name: 'asc' }],
      include: {
        stock: true,
      },
    })

    // Agrupar por familia
    const grouped: Record<ProductFamily, typeof products> = {
      NORMAL: [],
      WHITE: [],
      PACKAGED: [],
    }

    for (const product of products) {
      grouped[product.family].push(product)
    }

    return {
      NORMAL: grouped.NORMAL,
      WHITE: grouped.WHITE,
      PACKAGED: grouped.PACKAGED,
      summary: {
        totalProducts: products.length,
        totalUnits: products.reduce((sum, p) => sum + (p.stock?.onHand ?? 0), 0),
        belowAlert: products.filter(
          (p) => (p.stock?.onHand ?? 0) < p.alertThreshold,
        ).length,
      },
    }
  }

  // ─────────────────────────────────────────────────────────────
  // GET ALERTS — productos bajo el umbral
  // ─────────────────────────────────────────────────────────────
  async findAlerts() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: { stock: true },
      orderBy: [{ family: 'asc' }, { name: 'asc' }],
    })

    return products.filter(
      (p) => (p.stock?.onHand ?? 0) < p.alertThreshold,
    )
  }

  // ─────────────────────────────────────────────────────────────
  // GET ONE — stock de un producto específico
  // ─────────────────────────────────────────────────────────────
  async findOne(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { stock: true },
    })

    if (!product) throw new NotFoundException('Producto no encontrado')

    return product
  }

  // ─────────────────────────────────────────────────────────────
  // GET MOVEMENTS — historial de movimientos de un producto
  // ─────────────────────────────────────────────────────────────
  async findMovements(productId: string, limit = 50) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) throw new NotFoundException('Producto no encontrado')

    return this.prisma.inventoryMovement.findMany({
      where: { productId },
      orderBy: { occurredAt: 'desc' },
      take: limit,
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    })
  }

  // ─────────────────────────────────────────────────────────────
  // ADJUST — ajuste manual (merma, corrección, stock inicial)
  // ─────────────────────────────────────────────────────────────
  async adjustStock(productId: string, dto: AdjustStockDto, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { stock: true },
    })

    if (!product) throw new NotFoundException('Producto no encontrado')
    if (!product.isActive) throw new BadRequestException('El producto está inactivo')

    const currentOnHand = product.stock?.onHand ?? 0

    const newOnHand =
      dto.direction === MovementDirection.IN
        ? currentOnHand + dto.quantity
        : currentOnHand - dto.quantity

    if (newOnHand < 0) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${currentOnHand}, solicitado: ${dto.quantity}`,
      )
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.stock.upsert({
        where: { productId },
        update: { onHand: newOnHand },
        create: {
          productId,
          onHand: newOnHand,
          averageUnitCost: new Prisma.Decimal(0),
        },
      })

      await tx.inventoryMovement.create({
        data: {
          productId,
          type: InventoryMovementType.ADJUSTMENT,
          direction: dto.direction,
          quantity: dto.quantity,
          stockAfter: newOnHand,
          sourceType: 'MANUAL_ADJUSTMENT',
          note: `${dto.reason}${dto.note ? ` — ${dto.note}` : ''}`,
          occurredAt: new Date(),
          createdByUserId: userId,
        },
      })

      return this.prisma.product.findUnique({
        where: { id: productId },
        include: { stock: true },
      })
    })
  }
}