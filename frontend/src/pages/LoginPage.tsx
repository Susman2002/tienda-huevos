import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useRef } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import { useAuth } from '../hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Email no válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login, loading, error } = useAuth()
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [captchaError, setCaptchaError] = useState(false)
  const turnstileRef = useRef<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginForm) => {
    if (!turnstileToken) {
      setCaptchaError(true)
      return
    }
    setCaptchaError(false)
    login({ ...data, turnstileToken })
  }

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🥚</div>
          <h1 className="text-2xl font-bold text-primary-800">Tienda de Huevos</h1>
          <p className="text-sm text-primary-600 mt-1">Ingresa a tu cuenta para continuar</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <span className="text-red-500 text-lg leading-none mt-0.5">⚠</span>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@tiendahuevos.com"
                {...register('email')}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition
                  focus:ring-2 focus:ring-primary-400 focus:border-primary-400
                  ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'}`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition
                  focus:ring-2 focus:ring-primary-400 focus:border-primary-400
                  ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'}`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Cloudflare Turnstile */}
            <div className="flex flex-col items-center gap-1">
              <Turnstile
                ref={turnstileRef}
                siteKey="0x4AAAAAADiQdrFEOBJinNY7"
                onSuccess={(token) => {
                  setTurnstileToken(token)
                  setCaptchaError(false)
                }}
                onExpire={() => setTurnstileToken(null)}
                onError={() => {
                  setTurnstileToken(null)
                  setCaptchaError(true)
                }}
                options={{ theme: 'light', language: 'es' }}
              />
              {captchaError && (
                <p className="text-xs text-red-500">Por favor completa la verificación</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !turnstileToken}
              className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600
                disabled:bg-primary-300 disabled:cursor-not-allowed
                text-white font-semibold rounded-xl transition-colors
                focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
                flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>

          </form>
        </div>

        <p className="text-center text-xs text-primary-600 mt-6">
          Solo para administradores y vendedores autorizados
        </p>
      </div>
    </div>
  )
}