import { useState, useCallback } from 'react'
import { customersApi } from '../api/customers.api'
import type {
  WholesaleCustomer,
  DeletedCustomer,
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from '../types/customer.types'

export function useCustomers() {
  const [customers, setCustomers] = useState<WholesaleCustomer[]>([])
  const [deleted, setDeleted] = useState<DeletedCustomer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await customersApi.getAll()
      setCustomers(data)
    } catch {
      setError('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDeleted = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await customersApi.getDeleted()
      setDeleted(data)
    } catch {
      setError('Error al cargar clientes eliminados')
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(
    async (payload: CreateCustomerPayload) => {
      await customersApi.create(payload)
      await fetchAll()
    },
    [fetchAll],
  )

  const update = useCallback(
    async (id: string, payload: UpdateCustomerPayload) => {
      await customersApi.update(id, payload)
      await fetchAll()
    },
    [fetchAll],
  )

  const softDelete = useCallback(
    async (id: string) => {
      await customersApi.softDelete(id)
      await fetchAll()
    },
    [fetchAll],
  )

  const restore = useCallback(
    async (id: string) => {
      await customersApi.restore(id)
      await fetchDeleted()
    },
    [fetchDeleted],
  )

  return {
    customers,
    deleted,
    loading,
    error,
    fetchAll,
    fetchDeleted,
    create,
    update,
    softDelete,
    restore,
  }
}

export function useCustomerDetail(id: string) {
  const [customer, setCustomer] = useState<WholesaleCustomer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await customersApi.getOne(id)
      setCustomer(data)
    } catch {
      setError('Error al cargar el cliente')
    } finally {
      setLoading(false)
    }
  }, [id])

  return { customer, loading, error, fetch }
}