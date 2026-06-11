export type UserRole = 'ADMIN' | 'SELLER'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface LoginCredentials {
  email: string
  password: string
  turnstileToken: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}