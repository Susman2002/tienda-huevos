export type ProductFamily = 'NORMAL' | 'WHITE' | 'PACKAGED'
export type EggGrade = 'EXTRA' | 'ESPECIAL' | 'PRIMERA' | 'SEGUNDA' | 'TERCERA' | 'CUARTA' | 'QUINTA'
export type PackSize = 'P30' | 'P20' | 'P10' | 'P6'
export type BaseStockUnit = 'EGG' | 'PACK'

export interface Product {
  id: string
  sku: string
  name: string
  family: ProductFamily
  grade?: EggGrade | null
  packSize?: PackSize | null
  baseStockUnit: BaseStockUnit
  unitsPerPack?: number | null
  alertThreshold: number
  isActive: boolean
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateProductData {
  sku: string
  name: string
  family: ProductFamily
  baseStockUnit: BaseStockUnit
  grade?: EggGrade
  packSize?: PackSize
  unitsPerPack?: number
  notes?: string
  isActive?: boolean
}

export type UpdateProductData = Partial<CreateProductData>

// Labels para mostrar en UI
export const FAMILY_LABELS: Record<ProductFamily, string> = {
  NORMAL: 'Normal',
  WHITE: 'Blanco',
  PACKAGED: 'Empaquetado',
}

export const GRADE_LABELS: Record<EggGrade, string> = {
  EXTRA: 'Extra',
  ESPECIAL: 'Especial',
  PRIMERA: 'Primera',
  SEGUNDA: 'Segunda',
  TERCERA: 'Tercera',
  CUARTA: 'Cuarta',
  QUINTA: 'Quinta',
}

export const PACK_LABELS: Record<PackSize, string> = {
  P30: '30 unidades',
  P20: '20 unidades',
  P10: '10 unidades',
  P6: '6 unidades',
}

export const FAMILY_COLORS: Record<ProductFamily, string> = {
  NORMAL: 'bg-yellow-100 text-yellow-800',
  WHITE: 'bg-gray-100 text-gray-700',
  PACKAGED: 'bg-blue-100 text-blue-800',
}