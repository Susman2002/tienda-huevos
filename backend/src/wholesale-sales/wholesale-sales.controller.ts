import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Patch,
} from '@nestjs/common'
import { WholesaleSalesService } from './wholesale-sales.service'
import { CreateWholesaleSaleDto } from './dto/create-wholesale-sale.dto'
import { RegisterPaymentDto } from './dto/register-payment.dto'
import { QueryWholesaleSalesDto } from './dto/query-wholesale-sales.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@UseGuards(JwtAuthGuard)
@Controller('wholesale-sales')
export class WholesaleSalesController {
  constructor(private readonly service: WholesaleSalesService) {}

  // Clientes activos para el selector
  @Get('customers')
  getActiveCustomers() {
    return this.service.getActiveCustomers()
  }

  // Lista de ventas con filtros
  @Get()
  findAll(@Query() query: QueryWholesaleSalesDto) {
    return this.service.findAll(query)
  }

  // Detalle de una venta
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id)
  }

  // Crear venta
  @Post()
  create(
    @Body() dto: CreateWholesaleSaleDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.create(dto, user.id)
  }

  // Registrar pago posterior
  @Post(':id/payments')
  registerPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RegisterPaymentDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.registerPayment(id, dto, user.id)
  }

  // Cancelar venta
  @Patch(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.cancel(id, user.id)
  }
}