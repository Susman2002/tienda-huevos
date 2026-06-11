import { Type } from 'class-transformer'
import {
  IsUUID,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsPositive,
  IsArray,
  ValidateNested,
  Min,
  MaxLength,
  IsDecimal,
} from 'class-validator'
import { TransactionUnit, PaymentMethod } from '@prisma/client'

export class CreateSaleItemDto {
  @IsUUID()
  productId!: string

  @IsEnum(TransactionUnit, { message: 'Unidad de venta inválida' })
  saleUnit!: TransactionUnit

  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @IsPositive({ message: 'La cantidad debe ser mayor a 0' })
  quantity!: number

  @IsDecimal({ decimal_digits: '0,2' }, { message: 'El precio unitario debe ser un número válido' })
  unitPrice!: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string
}

export class CreateWholesaleSaleDto {
  @IsUUID()
  customerId!: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items!: CreateSaleItemDto[]

  // Pago inicial opcional
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  initialPayment?: string

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod

  @IsOptional()
  @IsString()
  @MaxLength(100)
  paymentReference?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string
}