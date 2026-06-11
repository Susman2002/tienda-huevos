import api from './axios'
import type {
  Supplier,
  SupplierOrder,
  SupplierPayment,
} from '../types/supplier.types'

// ── Proveedores ──────────────────────────────────────────────
export const suppliersApi = {
  getAll: () =>
    api.get<Supplier[]>('/suppliers').then((r) => r.data),

  getById: (id: string) =>
    api.get<Supplier>(`/suppliers/${id}`).then((r) => r.data),

  create: (data: {
    name: string
    contactName?: string
    phone?: string
    address?: string
    notes?: string
  }) => api.post<Supplier>('/suppliers', data).then((r) => r.data),

  update: (id: string, data: Partial<{
    name: string
    contactName: string
    phone: string
    address: string
    notes: string
  }>) => api.patch<Supplier>(`/suppliers/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/suppliers/${id}`).then((r) => r.data),
}

// ── Pedidos ───────────────────────────────────────────────────
export const ordersApi = {

  getBySupplier: (supplierId: string) =>
  api.get<SupplierOrder[]>(`/suppliers/${supplierId}/orders`).then((r) => r.data),

  getAll: () =>
    api.get<SupplierOrder[]>('/suppliers/orders').then((r) => r.data),

  getById: (id: string) =>
    api.get<SupplierOrder>(`/suppliers/orders/${id}`).then((r) => r.data),

  create: (data: {
    supplierId: string
    expectedDeliveryDate?: string
    notes?: string
    items: {
      productId: string
      orderedUnit: string
      orderedQuantity: number
      quotedUnitCost: number
    }[]
  }) => api.post<SupplierOrder>('/suppliers/orders', data).then((r) => r.data),

  receive: (
    orderId: string,
    data: {
      receivedAt?: string
      notes?: string
      items: {
        orderItemId: string
        receivedUnit: string
        receivedQuantity: number
        receivedUnitCost: number
      }[]
    },
  ) =>
    api
      .post<SupplierOrder>(`/suppliers/orders/${orderId}/receive`, data)
      .then((r) => r.data),

  registerPayment: (
    orderId: string,
    data: {
      amount: number
      method: string
      reference?: string
      notes?: string
      paymentDate?: string
    },
  ) =>
    api
      .post<SupplierPayment>(`/suppliers/orders/${orderId}/payments`, data)
      .then((r) => r.data),

  getPayments: (orderId: string) =>
    api
      .get<SupplierPayment[]>(`/suppliers/orders/${orderId}/payments`)
      .then((r) => r.data),
}

// ── Productos (para el formulario de pedido) ──────────────────
export const productsApi = {
  getAll: () =>
    api.get('/products').then((r) => r.data),
}