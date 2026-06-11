import { IsEnum, IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'
import { WholesaleSaleStatus } from '@prisma/client'

export class QueryWholesaleSalesDto {
  @IsOptional()
  @IsUUID()
  customerId?: string

  @IsOptional()
  @IsEnum(WholesaleSaleStatus)
  status?: WholesaleSaleStatus

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20
}