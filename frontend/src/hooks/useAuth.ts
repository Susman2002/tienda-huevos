import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuthStore } from '../store/auth.store'
import type { LoginCredentials, LoginResponse } from '../types/auth.types'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setAuth, clearAuth, user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const login = async (credentials: LoginCredentials) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', credentials)
      setAuth(data.user, data.accessToken)
      navigate('/dashboard')
    } catch (err: any) {
      const message =
        err.response?.data?.message ?? 'Error al iniciar sesión. Intenta de nuevo.'
      setError(Array.isArray(message) ? message[0] : message)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    clearAuth()
    navigate('/login')
  }

  return { login, logout, loading, error, user, isAuthenticated }
}