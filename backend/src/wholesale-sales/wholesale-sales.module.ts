import { Module } from '@nestjs/common'
import { WholesaleSalesService } from './wholesale-sales.service'
import { WholesaleSalesController } from './wholesale-sales.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [WholesaleSalesController],
  providers: [WholesaleSalesService],
  exports: [WholesaleSalesService],
})
export class WholesaleSalesModule {}