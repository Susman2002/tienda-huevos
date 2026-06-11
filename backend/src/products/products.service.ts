import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(onlyActive = false) {
    return this.prisma.product.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: [{ family: 'asc' }, { name: 'asc' }],
    })
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            supplierOrderItems: true,   // ✅ existe en el modelo
            inventoryMovements: true,   // ✅ existe en el modelo
          },
        },
      },
    })

    if (!product) throw new NotFoundException('Producto no encontrado')
    return product
  }

  async create(dto: CreateProductDto) {
    const existingName = await this.prisma.product.findFirst({
      where: { name: { equals: dto.name, mode: 'insensitive' } },
    })
    if (existingName) throw new ConflictException('Ya existe un producto con ese nombre')

    const existingSku = await this.prisma.product.findFirst({
      where: { sku: { equals: dto.sku, mode: 'insensitive' } },
    })
    if (existingSku) throw new ConflictException('Ya existe un producto con ese SKU')

    return this.prisma.product.create({
      data: {
        name: dto.name,
        sku: dto.sku,
        family: dto.family,
        baseStockUnit: dto.baseStockUnit,
        grade: dto.grade ?? null,
        packSize: dto.packSize ?? null,
        unitsPerPack: dto.unitsPerPack ?? null,   // ✅ nombre correcto del campo
        notes: dto.notes ?? null,                  // ✅ notes en lugar de description
        isActive: dto.isActive ?? true,
      },
    })
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id)

    if (dto.name) {
      const existingName = await this.prisma.product.findFirst({
        where: { name: { equals: dto.name, mode: 'insensitive' }, NOT: { id } },
      })
      if (existingName) throw new ConflictException('Ya existe un producto con ese nombre')
    }

    if (dto.sku) {
      const existingSku = await this.prisma.product.findFirst({
        where: { sku: { equals: dto.sku, mode: 'insensitive' }, NOT: { id } },
      })
      if (existingSku) throw new ConflictException('Ya existe un producto con ese SKU')
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.sku && { sku: dto.sku }),
        ...(dto.family && { family: dto.family }),
        ...(dto.baseStockUnit && { baseStockUnit: dto.baseStockUnit }),
        ...('grade' in dto && { grade: dto.grade ?? null }),
        ...('packSize' in dto && { packSize: dto.packSize ?? null }),
        ...('unitsPerPack' in dto && { unitsPerPack: dto.unitsPerPack ?? null }),
        ...('notes' in dto && { notes: dto.notes ?? null }),
        ...('isActive' in dto && { isActive: dto.isActive }),
      },
    })
  }

  async toggleActive(id: string) {
    const product = await this.findOne(id)
    return this.prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    })
  }
}