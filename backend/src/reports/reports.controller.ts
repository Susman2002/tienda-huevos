import { Controller, Get, Res, Query, UseGuards } from '@nestjs/common'
import type { Response } from 'express'
import { ReportsService } from './reports.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('top-products')
  async getTopProducts() {
    return this.reportsService.getTopSellingProducts()
  }

  @Get('suppliers-pdf')
  async getSuppliersPdf(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const buffer = await this.reportsService.generateSuppliersOrdersPdf(
      startDate,
      endDate,
    )

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=reporte-proveedores.pdf',
    )
    res.setHeader('Content-Length', buffer.length)
    res.end(buffer)
  }
}