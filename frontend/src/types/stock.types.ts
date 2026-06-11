import type { Product } from './product.types'

export type MovementDirection = 'IN' | 'OUT'
export type MovementType =
  | 'INITIAL_STOCK'
  | 'PURCHASE_RECEIPT'
  | 'WHOLESALE_SALE'
  | 'RETAIL_SALE'
  | 'ADJUSTMENT'
  | 'RETURN_IN'
  | 'RETURN_OUT'

export type MovementSourceType =
  | 'SUPPLIER_ORDER'
  | 'WHOLESALE_SALE'
  | 'RETAIL_DAILY_SALE'
  | 'MANUAL_ADJUSTMENT'

export interface Stock {
  id: string
  productId: string
  onHand: number
  averageUnitCost: string
  updatedAt: string
}

export interface ProductWithStock extends Product {
  stock: Stock | null
}

export interface StockSummary {
  totalProducts: number
  totalUnits: number
  belowAlert: number
}

export interface StockGroupedResponse {
  NORMAL: ProductWithStock[]
  WHITE: ProductWithStock[]
  PACKAGED: ProductWithStock[]
  summary: StockSummary
}

export interface InventoryMovement {
  id: string
  productId: string
  type: MovementType
  direction: MovementDirection
  quantity: number
  stockAfter: number
  unitCostSnapshot: string | null
  unitPriceSnapshot: string | null
  sourceType: MovementSourceType | null
  sourceId: string | null
  note: string | null
  occurredAt: string
  createdBy: { id: string; name: string } | null
}

export interface AdjustStockPayload {
  direction: MovementDirection
  quantity: number
  reason: string
  note?: string
}