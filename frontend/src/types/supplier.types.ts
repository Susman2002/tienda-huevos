export type SupplierOrderStatus =
  | 'ORDERED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED'

export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID'

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CHECK' | 'OTHER'

export type TransactionUnit = 'GROUP' | 'MAPLE' | 'UNIT' | 'PACK'

export type SupplierOrderItemStatus = 'PENDING' | 'PARTIAL' | 'RECEIVED'

export interface Supplier {
  id: string
  name: string
  contactName?: string
  phone?: string
  address?: string
  notes?: string
  createdAt: string
  orders?: SupplierOrder[]
}

export interface SupplierOrderItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    family: string
  }
  orderedUnit: TransactionUnit
  orderedQuantity: number
  orderedBaseQuantity: number
  quotedUnitCost: number
  receivedUnit?: TransactionUnit
  receivedQuantity?: number
  receivedBaseQuantity: number
  receivedUnitCost?: number
  lineStatus: SupplierOrderItemStatus
}

export interface SupplierPayment {
  id: string
  orderId: string
  amount: number
  paymentDate: string
  method: PaymentMethod
  reference?: string
  notes?: string
}

export interface SupplierOrder {
  id: string
  supplierId: string
  supplier?: Supplier
  status: SupplierOrderStatus
  paymentStatus: PaymentStatus
  orderedAt: string
  expectedDeliveryDate?: string
  notes?: string
  orderedTotalEstimated: number
  receivedTotalActual: number
  amountPaid: number
  balanceDue: number
  items: SupplierOrderItem[]
  payments: SupplierPayment[]
  createdBy?: { name: string }
}

export interface Product {
  id: string
  name: string
  family: string
  baseStockUnit: string
  unitsPerPack?: number
  isActive: boolean
}