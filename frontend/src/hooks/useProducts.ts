import { useState, useEffect, useCallback } from 'react'
import { productsApi } from '../api/products.api'
import type { Product, CreateProductData, UpdateProductData } from '../types/product.types'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await productsApi.getAll()
      setProducts(data)
    } catch {
      setError('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const createProduct = async (data: CreateProductData) => {
    const newProduct = await productsApi.create(data)
    setProducts(prev => [...prev, newProduct])
    return newProduct
  }

  const updateProduct = async (id: string, data: UpdateProductData) => {
    const updated = await productsApi.update(id, data)
    setProducts(prev => prev.map(p => p.id === id ? updated : p))
    return updated
  }

  const toggleProduct = async (id: string) => {
    const updated = await productsApi.toggle(id)
    setProducts(prev => prev.map(p => p.id === id ? updated : p))
    return updated
  }

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    toggleProduct,
  }
}