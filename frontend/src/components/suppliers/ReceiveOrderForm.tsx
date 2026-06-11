import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { SupplierOrderItem } from '../../types/supplier.types'

const itemSchema = z.object({
  orderItemId: z.string(),
  include: z.boolean(),
  receivedUnit: z.enum(['GROUP', 'MAPLE', 'UNIT', 'PACK']),
  receivedQuantity: z
    .string()
    .min(1, 'Requerido')
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(1, 'Mínimo 1')),
  receivedUnitCost: z
    .string()
    .min(1, 'Requerido')
    .transform((v) => parseFloat(v))
    .pipe(z.number().min(0.01, 'Costo inválido')),
})

const schema = z.object({
  receivedAt: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema),
})

type RawFormData = {
  receivedAt?: string
  notes?: string
  items: {
    orderItemId: string
    include: boolean
    receivedUnit: 'GROUP' | 'MAPLE' | 'UNIT' | 'PACK'
    receivedQuantity: string
    receivedUnitCost: string
  }[]
}

interface Props {
  orderItems: SupplierOrderItem[]
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

const unitOptions = [
  { value: 'GROUP', label: 'Grupo' },
  { value: 'MAPLE', label: 'Maple' },
  { value: 'UNIT', label: 'Unidad' },
  { value: 'PACK', label: 'Pack' },
]

export default function ReceiveOrderForm({ orderItems, onSubmit, onCancel }: Props) {
  const pendingItems = orderItems.filter((i) => i.lineStatus !== 'RECEIVED')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RawFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      items: pendingItems.map((item) => ({
        orderItemId: item.id,
        include: true,
        receivedUnit: item.orderedUnit,
        receivedQuantity: String(item.orderedQuantity),
        receivedUnitCost: String(item.quotedUnitCost),
      })),
    },
  })

  const watchedItems = watch('items')

  const handleFormSubmit = (data: any) => {
    const filtered = data.items
      .filter((item: any) => item.include)
      .map(({ include: _include, ...rest }: any) => rest)

    if (filtered.length === 0) return
    return onSubmit({ receivedAt: data.receivedAt, notes: data.notes, items: filtered })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-4">

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de recepción
        </label>
        <input
          type="date"
          {...register('receivedAt')}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-sm outline-none
            focus:ring-2 focus:ring-primary-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <input
          {...register('notes')}
          placeholder="Observaciones de la recepción..."
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-sm outline-none
            focus:ring-2 focus:ring-primary-400"
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Productos a recibir</p>

        {pendingItems.map((item, index) => (
          <div key={item.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                {...register(`items.${index}.include`)}
                className="w-4 h-4 accent-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {item.product.name}
              </span>
            </div>

            {watchedItems?.[index]?.include && (
              <div className="space-y-2 mt-2">
                <select
                  {...register(`items.${index}.receivedUnit`)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm outline-none
                    focus:ring-2 focus:ring-primary-400"
                >
                  {unitOptions.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      {...register(`items.${index}.receivedQuantity`)}
                      placeholder="Cantidad recibida"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm outline-none
                        focus:ring-2 focus:ring-primary-400"
                    />
                    {(errors.items as any)?.[index]?.receivedQuantity && (
                      <p className="mt-0.5 text-xs text-red-500">
                        {(errors.items as any)[index]?.receivedQuantity?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.receivedUnitCost`)}
                      placeholder="Costo real"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm outline-none
                        focus:ring-2 focus:ring-primary-400"
                    />
                    {(errors.items as any)?.[index]?.receivedUnitCost && (
                      <p className="mt-0.5 text-xs text-red-500">
                        {(errors.items as any)[index]?.receivedUnitCost?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium
            hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300
            text-white text-sm font-semibold transition"
        >
          {isSubmitting ? 'Registrando...' : 'Confirmar recepción'}
        </button>
      </div>
    </form>
  )
}