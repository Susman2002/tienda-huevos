import api from './axios'
import type { Product, CreateProductData, UpdateProductData } from '../types/product.types'

export const productsApi = {
  getAll: (onlyActive?: boolean) =>
    api.get<Product[]>('/products', {
      params: onlyActive ? { active: 'true' } : undefined,
    }).then(r => r.data),

  getOne: (id: string) =>
    api.get<Product>(`/products/${id}`).then(r => r.data),

  create: (data: CreateProductData) =>
    api.post<Product>('/products', data).then(r => r.data),

  update: (id: string, data: UpdateProductData) =>
    api.patch<Product>(`/products/${id}`, data).then(r => r.data),

  toggle: (id: string) =>
    api.patch<Product>(`/products/${id}/toggle`).then(r => r.data),
}