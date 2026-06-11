import api from './axios'

export type UserRole = 'ADMIN' | 'SELLER'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: UserRole
}

export const getUsers = async (): Promise<User[]> => {
  const { data } = await api.get<User[]>('/users')
  return data
}

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const { data } = await api.post<User>('/users', payload)
  return data
}

export const toggleUserActive = async (id: string): Promise<User> => {
  const { data } = await api.patch<User>(`/users/${id}/toggle-active`)
  return data
}