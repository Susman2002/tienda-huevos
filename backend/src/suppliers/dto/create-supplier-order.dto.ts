import { Type } from 'class-transformer'
import { IsArray, IsDateString, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator'
import { CreateSupplierOrderItemDto } from './create-supplier-order-item.dto'

export class CreateSupplierOrderDto {
  @IsUUID()
  supplierId!: string

  @IsOptional()
  @IsDateString({}, { message: 'La fecha esperada de entrega no es válida' })
  expectedDeliveryDate?: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsArray({ message: 'Los items deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => CreateSupplierOrderItemDto)
  items!: CreateSupplierOrderItemDto[]
}