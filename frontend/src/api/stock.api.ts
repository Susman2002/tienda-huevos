import api from './axios'
import type {
  StockGroupedResponse,
  ProductWithStock,
  InventoryMovement,
  AdjustStockPayload,
} from '../types/stock.types'

export const stockApi = {
  getAll: () =>
    api.get<StockGroupedResponse>('/stock').then((r) => r.data),

  getAlerts: () =>
    api.get<ProductWithStock[]>('/stock/alerts').then((r) => r.data),

  getOne: (productId: string) =>
    api.get<ProductWithStock>(`/stock/${productId}`).then((r) => r.data),

  getMovements: (productId: string, limit = 50) =>
    api
      .get<InventoryMovement[]>(`/stock/${productId}/movements`, {
        params: { limit },
      })
      .then((r) => r.data),

  adjust: (productId: string, data: AdjustStockPayload) =>
    api
      .patch<ProductWithStock>(`/stock/${productId}/adjust`, data)
      .then((r) => r.data),
}