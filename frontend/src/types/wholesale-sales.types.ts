export type SaleStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'CANCELLED'
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CHECK' | 'OTHER'
export type TransactionUnit = 'GROUP' | 'MAPLE' | 'UNIT' | 'PACK'
export type ProductFamily = 'NORMAL' | 'WHITE' | 'PACKAGED'

export interface ActiveCustomer {
  id: string
  code: string
  businessName: string
  contactName: string | null
  phone: string | null
  creditLimit: string
  totalDebt: number
  lastSaleDate: string | null
  lastSaleStatus: SaleStatus | null
}

export interface SaleItem {
  id: string
  productId: string
  saleUnit: TransactionUnit
  quantity: number
  baseQuantity: number
  unitPrice: string
  estimatedUnitCost: string
  subtotal: string
  estimatedProfit: string
  notes: string | null
  product: {
    id: string
    sku: string
    name: string
    family: ProductFamily
  }
}

export interface PaymentAllocation {
  id: string
  amount: string
  payment: {
    id: string
    amount: string
    paymentDate: string
    method: PaymentMethod
    reference: string | null
    registeredBy: { id: string; name: string }
  }
}

export interface WholesaleSale {
  id: string
  saleDate: string
  status: SaleStatus
  subtotal: string
  amountPaid: string
  balanceDue: string
  estimatedCostTotal: string
  estimatedProfitTotal: string
  notes: string | null
  createdAt: string
  customer: {
    id: string
    code: string
    businessName: string
    phone: string | null
  }
  createdBy: { id: string; name: string }
  _count?: { items: number }
}

export interface WholesaleSaleDetail extends WholesaleSale {
  items: SaleItem[]
  paymentAllocations: PaymentAllocation[]
}

export interface SalesListResponse {
  data: WholesaleSale[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateSaleItemDto {
  productId: string
  saleUnit: TransactionUnit
  quantity: number
  unitPrice: string
  notes?: string
}

export interface CreateSaleDto {
  customerId: string
  items: CreateSaleItemDto[]
  initialPayment?: string
  paymentMethod?: PaymentMethod
  paymentReference?: string
  notes?: string
}

export interface RegisterPaymentDto {
  amount: string
  method: PaymentMethod
  reference?: string
  notes?: string
}