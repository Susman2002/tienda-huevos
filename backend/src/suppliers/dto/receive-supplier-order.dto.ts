import { Type } from 'class-transformer'
import { IsArray, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator'
import { ReceiveSupplierOrderItemDto } from './receive-supplier-order-item.dto'

export class ReceiveSupplierOrderDto {
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de recepción no es válida' })
  receivedAt?: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsArray({ message: 'Los items recibidos deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => ReceiveSupplierOrderItemDto)
  items!: ReceiveSupplierOrderItemDto[]
}