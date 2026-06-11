import { PaymentMethod } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class RegisterSupplierPaymentDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'El monto debe ser un número válido' })
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  amount!: number

  @IsEnum(PaymentMethod)
  method!: PaymentMethod

  @IsOptional()
  @IsString()
  reference?: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de pago no es válida' })
  paymentDate?: string
}