import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  getUsers,
  createUser,
  toggleUserActive,
  //type UserRole,
} from '../api/users.api'
import { usePasswordStrength } from '../hooks/usePasswordStrength'
import { UserPlus, Shield, ShieldOff, Eye, EyeOff, Users, Loader2 } from 'lucide-react'

const createUserSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Correo no válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.enum(['ADMIN', 'SELLER']),
})

type CreateUserForm = z.infer<typeof createUserSchema>

const PasswordStrengthBar: React.FC<{ password: string }> = ({ password }) => {
  const { strength, label, color, barColor, score } = usePasswordStrength(password)

  if (strength === 'empty') return null

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? barColor : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${color}`}>
        Contraseña: {label}
      </p>
    </div>
  )
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const [serverError, setServerError] = useState('')

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowForm(false)
      setPasswordValue('')
      reset()
      setServerError('')
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message
      setServerError(typeof msg === 'string' ? msg : 'Error al crear el usuario')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: toggleUserActive,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'SELLER' },
  })

  const onSubmit = (data: CreateUserForm) => {
    setServerError('')
    createMutation.mutate(data)
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-500">Administra los accesos al sistema</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setServerError('') }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-indigo-200"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Formulario crear usuario */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            Crear nuevo usuario
          </h2>

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              ⚠ {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  {...register('name')}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition
                    focus:ring-2 focus:ring-indigo-400
                    ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'}`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="usuario@tienda.com"
                  {...register('email')}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition
                    focus:ring-2 focus:ring-indigo-400
                    ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'}`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password', {
                      onChange: (e) => setPasswordValue(e.target.value),
                    })}
                    className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm outline-none transition
                      focus:ring-2 focus:ring-indigo-400
                      ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
                <PasswordStrengthBar password={passwordValue} />
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  {...register('role')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-sm outline-none transition focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="SELLER">Vendedor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Crear Usuario
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); reset(); setPasswordValue(''); setServerError('') }}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-800">
            Usuarios registrados ({users?.length ?? 0})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {users?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                    ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-full
                    ${user.role === 'ADMIN'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-emerald-100 text-emerald-700'}`}>
                    {user.role === 'ADMIN' ? 'Admin' : 'Vendedor'}
                  </span>

                  <button
                    onClick={() => toggleMutation.mutate(user.id)}
                    disabled={toggleMutation.isPending}
                    title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                    className={`p-2 rounded-lg transition-colors ${
                      user.isActive
                        ? 'text-emerald-600 hover:bg-emerald-50'
                        : 'text-red-400 hover:bg-red-50'
                    }`}
                  >
                    {user.isActive
                      ? <Shield className="w-5 h-5" />
                      : <ShieldOff className="w-5 h-5" />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}