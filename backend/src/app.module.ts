import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { SuppliersModule } from './suppliers/suppliers.module'
import { ProductsModule } from './products/products.module'
import { StockModule } from './stock/stock.module'
import { CustomersModule } from './customers/customers.module'
import { WholesaleSalesModule } from './wholesale-sales/wholesale-sales.module'
import { ReportsModule } from './reports/reports.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    SuppliersModule,
    ProductsModule,
    StockModule,
    CustomersModule,
    WholesaleSalesModule,
    ReportsModule,
    UsersModule,
  ],
})
export class AppModule {}