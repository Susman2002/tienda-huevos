import { TransactionUnit } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNumber, IsUUID, Min } from 'class-validator'

export class ReceiveSupplierOrderItemDto {
  @IsUUID()
  orderItemId!: string

  @IsEnum(TransactionUnit)
  receivedUnit!: TransactionUnit

  @Type(() => Number)
  @IsInt({ message: 'La cantidad recibida debe ser un número entero' })
  @Min(1, { message: 'La cantidad recibida debe ser mayor a 0' })
  receivedQuantity!: number

  @Type(() => Number)
  @IsNumber({}, { message: 'El costo recibido debe ser un número válido' })
  @Min(0.01, { message: 'El costo recibido debe ser mayor a 0' })
  receivedUnitCost!: number
}