import { TransactionUnit, ProductFamily, BaseStockUnit } from '@prisma/client'
import { BadRequestException } from '@nestjs/common'

// Conversión a unidades base (huevos individuales o packs)
export function toBaseQuantity(
  quantity: number,
  unit: TransactionUnit,
  family: ProductFamily,
  baseStockUnit: BaseStockUnit,
  unitsPerPack: number | null,
): number {
  // Empaquetados: solo PACK, 1 PACK = 1 unidad de stock
  if (family === ProductFamily.PACKAGED) {
    if (unit !== TransactionUnit.PACK) {
      throw new BadRequestException(
        'Los productos empaquetados solo se pueden vender por PACK',
      )
    }
    return quantity // 1 PACK = 1 unidad de stock
  }

  // Huevos normales y blancos: GROUP, MAPLE, UNIT
  if (unit === TransactionUnit.PACK) {
    throw new BadRequestException(
      'Los huevos normales y blancos no se pueden vender por PACK',
    )
  }

  switch (unit) {
    case TransactionUnit.GROUP:
      return quantity * 300
    case TransactionUnit.MAPLE:
      return quantity * 30
    case TransactionUnit.UNIT:
      return quantity
    default:
      throw new BadRequestException(`Unidad de venta no reconocida: ${unit}`)
  }
}

// Etiqueta legible para la unidad
export function unitLabel(unit: TransactionUnit): string {
  const labels: Record<TransactionUnit, string> = {
    GROUP: 'Grupo (300)',
    MAPLE: 'Maple (30)',
    UNIT: 'Unidad',
    PACK: 'Pack',
  }
  return labels[unit] ?? unit
}