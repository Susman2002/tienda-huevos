import { TransactionUnit } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNumber, IsUUID, Min } from 'class-validator'

export class CreateSupplierOrderItemDto {
  @IsUUID()
  productId!: string

  @IsEnum(TransactionUnit)
  orderedUnit!: TransactionUnit

  @Type(() => Number)
  @IsInt({ message: 'La cantidad pedida debe ser un número entero' })
  @Min(1, { message: 'La cantidad pedida debe ser mayor a 0' })
  orderedQuantity!: number

  @Type(() => Number)
  @IsNumber({}, { message: 'El costo cotizado debe ser un número válido' })
  @Min(0.01, { message: 'El costo cotizado debe ser mayor a 0' })
  quotedUnitCost!: number
}