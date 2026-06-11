import {
  IsString,
  IsOptional,
  IsDecimal,
  Matches,
  MaxLength,
  MinLength,
  IsNumberString,
} from 'class-validator'

export class CreateCustomerDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede superar 100 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/, {
    message: 'El nombre solo puede contener letras y espacios',
  })
  businessName!: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/, {
    message: 'El nombre de contacto solo puede contener letras y espacios',
  })
  contactName?: string

  @IsOptional()
  @IsNumberString({}, { message: 'El teléfono solo puede contener números' })
  @MinLength(7, { message: 'El teléfono debe tener al menos 7 dígitos' })
  @MaxLength(15, { message: 'El teléfono no puede superar 15 dígitos' })
  phone?: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'El documento no puede superar 20 caracteres' })
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'El documento solo puede contener letras, números y guiones',
  })
  documentNumber?: string

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' }, { message: 'El límite de crédito debe ser un número válido' })
  creditLimit?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string
}