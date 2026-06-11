import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator'
import { MovementDirection } from '@prisma/client'

export class AdjustStockDto {
  @IsEnum(MovementDirection)
  direction!: MovementDirection

  @IsInt()
  @Min(1)
  quantity!: number

  @IsString()
  @IsNotEmpty()
  reason!: string

  @IsString()
  @IsOptional()
  note?: string
}