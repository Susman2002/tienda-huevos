import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { CreateSupplierDto } from './dto/create-supplier.dto'
import { UpdateSupplierDto } from './dto/update-supplier.dto'
import { CreateSupplierOrderDto } from './dto/create-supplier-order.dto'
import { ReceiveSupplierOrderDto } from './dto/receive-supplier-order.dto'
import { RegisterSupplierPaymentDto } from './dto/register-supplier-payment.dto'
import { SuppliersService } from './suppliers.service'

@UseGuards(JwtAuthGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  // ─────────────────────────────────────────────────────────────
  // SUPPLIERS
  // ─────────────────────────────────────────────────────────────
  @Post()
  createSupplier(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.createSupplier(dto)
  }

  @Get()
  findAllSuppliers() {
    return this.suppliersService.findAllSuppliers()
  }

  // ⚠️ RUTAS ESTÁTICAS PRIMERO — antes de cualquier :id
  // ─────────────────────────────────────────────────────────────
  // SUPPLIER ORDERS
  // ─────────────────────────────────────────────────────────────
  @Post('orders')
  createSupplierOrder(
    @Body() dto: CreateSupplierOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.suppliersService.createSupplierOrder(dto, user.id)
  }

  @Get('orders')
  findAllSupplierOrders() {
    return this.suppliersService.findAllSupplierOrders()
  }

  @Get('orders/:id')
  findSupplierOrderById(@Param('id') id: string) {
    return this.suppliersService.findSupplierOrderById(id)
  }

  @Post('orders/:id/receive')
  receiveSupplierOrder(
    @Param('id') id: string,
    @Body() dto: ReceiveSupplierOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.suppliersService.receiveSupplierOrder(id, dto, user.id)
  }

  @Post('orders/:id/payments')
  registerSupplierPayment(
    @Param('id') id: string,
    @Body() dto: RegisterSupplierPaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.suppliersService.registerSupplierPayment(id, dto, user.id)
  }

  @Get('orders/:id/payments')
  findSupplierPayments(@Param('id') id: string) {
    return this.suppliersService.findSupplierPayments(id)
  }

  // ─────────────────────────────────────────────────────────────
  // RUTAS DINÁMICAS AL FINAL
  // ─────────────────────────────────────────────────────────────
  @Get(':id')
  findSupplierById(@Param('id') id: string) {
    return this.suppliersService.findSupplierById(id)
  }

  // ✅ NUEVO: pedidos por proveedor
  @Get(':id/orders')
  findOrdersBySupplier(@Param('id') id: string) {
    return this.suppliersService.findOrdersBySupplier(id)
  }

  @Patch(':id')
  updateSupplier(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.updateSupplier(id, dto)
  }

  @Delete(':id')
  deleteSupplier(@Param('id') id: string) {
    return this.suppliersService.deleteSupplier(id)
  }
}