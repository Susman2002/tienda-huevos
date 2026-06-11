import { IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateSupplierDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre del proveedor debe tener al menos 2 caracteres' })
  name?: string

  @IsOptional()
  @IsString()
  contactName?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  notes?: string
}