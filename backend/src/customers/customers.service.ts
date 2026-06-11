import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  // Genera código único: CLI-0001, CLI-0002, etc.
  private async generateCode(): Promise<string> {
    const last = await this.prisma.wholesaleCustomer.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { code: true },
    })
    if (!last) return 'CLI-0001'
    const num = parseInt(last.code.split('-')[1] ?? '0', 10)
    return `CLI-${String(num + 1).padStart(4, '0')}`
  }

  async create(dto: CreateCustomerDto) {
    // Verificar duplicado por nombre de negocio
    const exists = await this.prisma.wholesaleCustomer.findFirst({
      where: {
        businessName: { equals: dto.businessName, mode: 'insensitive' },
        deletedAt: null,
      },
    })
    if (exists) {
      throw new ConflictException(
        `Ya existe un cliente con el nombre "${dto.businessName}"`,
      )
    }

    const code = await this.generateCode()

    return this.prisma.wholesaleCustomer.create({
      data: {
        code,
        businessName: dto.businessName,
        contactName: dto.contactName,
        phone: dto.phone,
        address: dto.address,
        documentNumber: dto.documentNumber,
        creditLimit: dto.creditLimit ? parseFloat(dto.creditLimit) : null,
        notes: dto.notes,
      },
    })
  }

  async findAll() {
    return this.prisma.wholesaleCustomer.findMany({
      where: { deletedAt: null },
      orderBy: { businessName: 'asc' },
      select: {
        id: true,
        code: true,
        businessName: true,
        contactName: true,
        phone: true,
        address: true,
        documentNumber: true,
        creditLimit: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Deuda total: suma de balanceDue de ventas no canceladas
        sales: {
          where: { status: { not: 'CANCELLED' } },
          select: { balanceDue: true },
        },
      },
    })
  }

  async findDeleted() {
    return this.prisma.wholesaleCustomer.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
      select: {
        id: true,
        code: true,
        businessName: true,
        contactName: true,
        phone: true,
        deletedAt: true,
        deletedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    })
  }

  async findOne(id: string) {
    const customer = await this.prisma.wholesaleCustomer.findFirst({
      where: { id, deletedAt: null },
      include: {
        sales: {
          where: { status: { not: 'CANCELLED' } },
          orderBy: { saleDate: 'desc' },
          take: 10,
          select: {
            id: true,
            saleDate: true,
            status: true,
            subtotal: true,
            amountPaid: true,
            balanceDue: true,
          },
        },
      },
    })

    if (!customer) throw new NotFoundException('Cliente no encontrado')
    return customer
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const customer = await this.prisma.wholesaleCustomer.findFirst({
      where: { id, deletedAt: null },
    })
    if (!customer) throw new NotFoundException('Cliente no encontrado')

    // Verificar duplicado de nombre si se está cambiando
    if (dto.businessName && dto.businessName !== customer.businessName) {
      const exists = await this.prisma.wholesaleCustomer.findFirst({
        where: {
          businessName: { equals: dto.businessName, mode: 'insensitive' },
          deletedAt: null,
          id: { not: id },
        },
      })
      if (exists) {
        throw new ConflictException(
          `Ya existe un cliente con el nombre "${dto.businessName}"`,
        )
      }
    }

    return this.prisma.wholesaleCustomer.update({
      where: { id },
      data: {
        ...(dto.businessName && { businessName: dto.businessName }),
        ...(dto.contactName !== undefined && { contactName: dto.contactName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.documentNumber !== undefined && { documentNumber: dto.documentNumber }),
        ...(dto.creditLimit !== undefined && {
          creditLimit: dto.creditLimit ? parseFloat(dto.creditLimit) : null,
        }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    })
  }

  async softDelete(id: string, adminId: string) {
    const customer = await this.prisma.wholesaleCustomer.findFirst({
      where: { id, deletedAt: null },
    })
    if (!customer) throw new NotFoundException('Cliente no encontrado')

    // Verificar que no tenga deuda pendiente
    const pendingDebt = await this.prisma.wholesaleSale.aggregate({
      where: {
        customerId: id,
        status: { in: ['PENDING', 'PARTIAL'] },
      },
      _sum: { balanceDue: true },
    })

    const totalDebt = Number(pendingDebt._sum.balanceDue ?? 0)
    if (totalDebt > 0) {
      throw new BadRequestException(
        `El cliente tiene una deuda pendiente de Bs. ${totalDebt.toFixed(2)}. Salda la deuda antes de eliminar.`,
      )
    }

    return this.prisma.wholesaleCustomer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId: adminId,
        isActive: false,
      },
      select: {
        id: true,
        code: true,
        businessName: true,
        deletedAt: true,
        deletedBy: { select: { id: true, name: true } },
      },
    })
  }

  async restore(id: string) {
    const customer = await this.prisma.wholesaleCustomer.findFirst({
      where: { id, deletedAt: { not: null } },
    })
    if (!customer) throw new NotFoundException('Cliente no encontrado o no está eliminado')

    return this.prisma.wholesaleCustomer.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedByUserId: null,
        isActive: true,
      },
    })
  }
}