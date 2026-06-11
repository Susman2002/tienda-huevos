import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsOptional,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator'
import { ProductFamily, EggGrade, PackSize, BaseStockUnit } from '@prisma/client'

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100, { message: 'Máximo 100 caracteres' })
  name!: string

  @IsString()
  @IsNotEmpty({ message: 'El SKU es requerido' })
  @MaxLength(50, { message: 'Máximo 50 caracteres' })
  sku!: string

  @IsEnum(ProductFamily, { message: 'Familia de producto inválida: NORMAL, WHITE, PACKAGED' })
  family!: ProductFamily

  @IsEnum(BaseStockUnit, { message: 'Unidad base inválida: EGG, PACK' })
  baseStockUnit!: BaseStockUnit

  @IsInt({ message: 'La cantidad base debe ser un entero' })
  @Min(1, { message: 'Mínimo 1' })
  baseQuantity!: number

  @IsOptional()
  @IsEnum(EggGrade, { message: 'Grado inválido' })
  grade?: EggGrade

  @IsOptional()
  @IsEnum(PackSize, { message: 'Tamaño de pack inválido: P30, P20, P10, P6' })
  packSize?: PackSize

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'Máximo 300 caracteres' })
  description?: string

  @IsOptional()
@IsInt({ message: 'Debe ser un entero' })
@Min(1, { message: 'Mínimo 1' })
unitsPerPack?: number

@IsOptional()
@IsString()
@MaxLength(500, { message: 'Máximo 500 caracteres' })
notes?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}