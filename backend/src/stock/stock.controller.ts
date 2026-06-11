import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { StockService } from './stock.service'
import { AdjustStockDto } from './dto/adjust-stock.dto'

@UseGuards(JwtAuthGuard)
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  findAll() {
    return this.stockService.findAll()
  }

  @Get('alerts')
  findAlerts() {
    return this.stockService.findAlerts()
  }

  @Get(':productId')
  findOne(@Param('productId') productId: string) {
    return this.stockService.findOne(productId)
  }

  @Get(':productId/movements')
  findMovements(
    @Param('productId') productId: string,
    @Query('limit') limit?: string,
  ) {
    return this.stockService.findMovements(productId, limit ? parseInt(limit) : 50)
  }

  @Patch(':productId/adjust')
  adjustStock(
    @Param('productId') productId: string,
    @Body() dto: AdjustStockDto,
    @CurrentUser() user: any,
  ) {
    return this.stockService.adjustStock(productId, dto, user.id)
  }
}