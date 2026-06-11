import { useState, useCallback } from 'react'
import { stockApi } from '../api/stock.api'
import type {
  StockGroupedResponse,
  ProductWithStock,
  InventoryMovement,
  AdjustStockPayload,
} from '../types/stock.types'

export function useStock() {
  const [data, setData] = useState<StockGroupedResponse | null>(null)
  const [alerts, setAlerts] = useState<ProductWithStock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await stockApi.getAll()
      setData(result)
    } catch {
      setError('Error al cargar el stock')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAlerts = useCallback(async () => {
    try {
      const result = await stockApi.getAlerts()
      setAlerts(result)
    } catch {
      setError('Error al cargar alertas')
    }
  }, [])

  const adjust = useCallback(
    async (productId: string, payload: AdjustStockPayload) => {
      await stockApi.adjust(productId, payload)
      await fetchAll()
    },
    [fetchAll],
  )

  return { data, alerts, loading, error, fetchAll, fetchAlerts, adjust }
}

export function useStockMovements(productId: string) {
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [product, setProduct] = useState<ProductWithStock | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    setError(null)
    try {
      const [prod, movs] = await Promise.all([
        stockApi.getOne(productId),
        stockApi.getMovements(productId),
      ])
      setProduct(prod)
      setMovements(movs)
    } catch {
      setError('Error al cargar movimientos')
    } finally {
      setLoading(false)
    }
  }, [productId])

  return { product, movements, loading, error, fetch }
}