import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, TrendingUp, TrendingDown } from 'lucide-react'
import type { ProductWithStock, AdjustStockPayload } from '../../types/stock.types'

const schema = z.object({
  direction: z.enum(['IN', 'OUT']),
  quantity: z.number().int().min(1, 'Mínimo 1 unidad'),  // ← sin coerce
  reason: z.string().min(3, 'Ingresa un motivo'),
  note: z.string().optional(),
})

// Tipo explícito del output del schema
type FormData = {
  direction: 'IN' | 'OUT'
  quantity: number
  reason: string
  note?: string
}

interface Props {
  product: ProductWithStock | null
  onClose: () => void
  onConfirm: (productId: string, payload: AdjustStockPayload) => Promise<void>
}

export default function AdjustStockModal({ product, onClose, onConfirm }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,  // ← cast necesario por coerce
    defaultValues: { direction: 'IN', quantity: 1, reason: '' },
  })

  const direction = watch('direction')
  const quantity = watch('quantity')
  const currentOnHand = product?.stock?.onHand ?? 0
  const preview =
    direction === 'IN' ? currentOnHand + (quantity || 0) : currentOnHand - (quantity || 0)

  useEffect(() => {
    if (product) reset({ direction: 'IN', quantity: 1, reason: '' })
  }, [product, reset])

  if (!product) return null

  const onSubmit = async (data: FormData) => {
    await onConfirm(product.id, data)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-gray-800">Ajustar Stock</h2>
            <p className="text-xs text-gray-500 mt-0.5">{product.name}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 space-y-4">
          {/* Dirección */}
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 cursor-pointer transition-colors ${
                direction === 'IN'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input type="radio" value="IN" {...register('direction')} className="sr-only" />
              <TrendingUp size={20} className={direction === 'IN' ? 'text-green-600' : 'text-gray-400'} />
              <span className={`text-sm font-medium ${direction === 'IN' ? 'text-green-700' : 'text-gray-500'}`}>
                Entrada
              </span>
            </label>
            <label
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 cursor-pointer transition-colors ${
                direction === 'OUT'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input type="radio" value="OUT" {...register('direction')} className="sr-only" />
              <TrendingDown size={20} className={direction === 'OUT' ? 'text-red-600' : 'text-gray-400'} />
              <span className={`text-sm font-medium ${direction === 'OUT' ? 'text-red-700' : 'text-gray-500'}`}>
                Salida
              </span>
            </label>
          </div>

          {/* Cantidad — valueAsNumber para evitar el problema de coerce */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad <span className="text-gray-400 font-normal">(unidades base)</span>
            </label>
            <input
              type="number"
              min={1}
              {...register('quantity', { valueAsNumber: true })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-red-500">{errors.quantity.message}</p>
            )}
          </div>

          {/* Preview */}
          <div className="rounded-lg bg-gray-50 px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">Stock actual</span>
            <span className="font-semibold">{currentOnHand.toLocaleString()}</span>
          </div>
          <div
            className={`rounded-lg px-4 py-3 flex items-center justify-between text-sm ${
              preview < 0
                ? 'bg-red-50'
                : direction === 'IN'
                ? 'bg-green-50'
                : 'bg-orange-50'
            }`}
          >
            <span className="text-gray-600">Stock resultante</span>
            <span
              className={`font-bold text-base ${
                preview < 0 ? 'text-red-600' : direction === 'IN' ? 'text-green-700' : 'text-orange-700'
              }`}
            >
              {preview < 0 ? '⚠ Insuficiente' : preview.toLocaleString()}
            </span>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
            <select
              {...register('reason')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Selecciona un motivo</option>
              <option value="Merma por rotura">Merma por rotura</option>
              <option value="Merma por vencimiento">Merma por vencimiento</option>
              <option value="Corrección de conteo">Corrección de conteo</option>
              <option value="Stock inicial">Stock inicial</option>
              <option value="Devolución">Devolución</option>
              <option value="Otro">Otro</option>
            </select>
            {errors.reason && (
              <p className="mt-1 text-xs text-red-500">{errors.reason.message}</p>
            )}
          </div>

          {/* Nota opcional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nota <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              {...register('note')}
              placeholder="Detalle adicional..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || preview < 0}
              className="flex-1 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Guardando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}