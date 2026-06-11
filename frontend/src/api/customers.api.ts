import api from './axios'
import type {
  WholesaleCustomer,
  DeletedCustomer,
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from '../types/customer.types'

export const customersApi = {
  getAll: () =>
    api.get<WholesaleCustomer[]>('/customers').then((r) => r.data),

  getDeleted: () =>
    api.get<DeletedCustomer[]>('/customers/deleted').then((r) => r.data),

  getOne: (id: string) =>
    api.get<WholesaleCustomer>(`/customers/${id}`).then((r) => r.data),

  create: (data: CreateCustomerPayload) =>
    api.post<WholesaleCustomer>('/customers', data).then((r) => r.data),

  update: (id: string, data: UpdateCustomerPayload) =>
    api.patch<WholesaleCustomer>(`/customers/${id}`, data).then((r) => r.data),

  softDelete: (id: string) =>
    api.delete(`/customers/${id}`).then((r) => r.data),

  restore: (id: string) =>
    api.patch(`/customers/${id}/restore`).then((r) => r.data),
}