export interface WholesaleCustomer {
  id: string
  code: string
  businessName: string
  contactName: string | null
  phone: string | null
  address: string | null
  documentNumber: string | null
  creditLimit: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  sales?: {
    id: string
    saleDate: string
    status: string
    subtotal: string
    amountPaid: string
    balanceDue: string
  }[]
}

export interface DeletedCustomer {
  id: string
  code: string
  businessName: string
  contactName: string | null
  phone: string | null
  deletedAt: string
  deletedBy: {
    id: string
    name: string
    email: string
  } | null
}

export interface CreateCustomerPayload {
  businessName: string
  contactName?: string
  phone?: string
  address?: string
  documentNumber?: string
  creditLimit?: string
  notes?: string
}

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>