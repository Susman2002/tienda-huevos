import { IsDecimal, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator'
import { PaymentMethod } from '@prisma/client'

export class RegisterPaymentDto {
  @IsDecimal({ decimal_digits: '0,2' }, { message: 'El monto debe ser un número válido' })
  amount!: string

  @IsEnum(PaymentMethod, { message: 'Método de pago inválido' })
  method!: PaymentMethod

  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string
}