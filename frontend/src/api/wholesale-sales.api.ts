import api from './axios'
import type {
  ActiveCustomer,
  SalesListResponse,
  WholesaleSaleDetail,
  CreateSaleDto,
  RegisterPaymentDto,
  WholesaleSale,
} from '../types/wholesale-sales.types'

export const wholesaleSalesApi = {
  getActiveCustomers: async (): Promise<ActiveCustomer[]> => {
    const res = await api.get('/wholesale-sales/customers')
    return res.data
  },

  getAll: async (params?: {
    customerId?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<SalesListResponse> => {
    const res = await api.get('/wholesale-sales', { params })
    return res.data
  },

  getOne: async (id: string): Promise<WholesaleSaleDetail> => {
    const res = await api.get(`/wholesale-sales/${id}`)
    return res.data
  },

  create: async (dto: CreateSaleDto): Promise<WholesaleSale> => {
    const res = await api.post('/wholesale-sales', dto)
    return res.data
  },

  registerPayment: async (
    saleId: string,
    dto: RegisterPaymentDto,
  ): Promise<{ sale: WholesaleSale; payment: unknown }> => {
    const res = await api.post(`/wholesale-sales/${saleId}/payments`, dto)
    return res.data
  },

  cancel: async (saleId: string): Promise<WholesaleSale> => {
    const res = await api.patch(`/wholesale-sales/${saleId}/cancel`, {})
    return res.data
  },
}