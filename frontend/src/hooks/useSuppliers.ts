import { useState, useEffect, useCallback } from 'react'
import { suppliersApi, ordersApi } from '../api/suppliers.api'
import type { Supplier, SupplierOrder } from '../types/supplier.types'

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await suppliersApi.getAll()
      setSuppliers(data)
    } catch {
      setError('No se pudieron cargar los proveedores')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  const createSupplier = async (data: Parameters<typeof suppliersApi.create>[0]) => {
    const created = await suppliersApi.create(data)
    setSuppliers((prev) => [...prev, created])
    return created
  }

  const updateSupplier = async (id: string, data: Parameters<typeof suppliersApi.update>[1]) => {
    const updated = await suppliersApi.update(id, data)
    setSuppliers((prev) => prev.map((s) => (s.id === id ? updated : s)))
    return updated
  }

  const deleteSupplier = async (id: string) => {
    await suppliersApi.delete(id)
    setSuppliers((prev) => prev.filter((s) => s.id !== id))
  }

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  }
}

export function useSupplierOrders() {
  const [orders, setOrders] = useState<SupplierOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ordersApi.getAll()
      setOrders(data)
    } catch {
      setError('No se pudieron cargar los pedidos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return { orders, loading, error, fetchOrders }
}