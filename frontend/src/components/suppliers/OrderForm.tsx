import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../../api/axios'
import type { Product, Supplier } from '../../types/supplier.types'

const itemSchema = z.object({
  productId: z.string().min(1, 'Selecciona un producto'),
  orderedUnit: z.enum(['GROUP', 'MAPLE', 'UNIT', 'PACK']),
  orderedQuantity: z
    .string()
    .min(1, 'Requerido')
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(1, 'Mínimo 1')),
  quotedUnitCost: z
    .string()
    .min(1, 'Requerido')
    .transform((v) => parseFloat(v))
    .pipe(z.number().min(0.01, 'Costo inválido')),
})

const schema = z.object({
  supplierId: z.string().min(1, 'Selecciona un proveedor'),
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Agrega al menos un producto'),
})

type FormData = z.infer<typeof schema>
type RawFormData = {
  supplierId: string
  expectedDeliveryDate?: string
  notes?: string
  items: {
    productId: string
    orderedUnit: 'GROUP' | 'MAPLE' | 'UNIT' | 'PACK'
    orderedQuantity: string
    quotedUnitCost: string
  }[]
}

interface Props {
  suppliers: Supplier[]
  onSubmit: (data: FormData) => Promise<void>
  onCancel: () => void
}

const unitOptions = [
  { value: 'GROUP', label: 'Grupo (300 huevos)' },
  { value: 'MAPLE', label: 'Maple (30 huevos)' },
  { value: 'UNIT', label: 'Unidad' },
  { value: 'PACK', label: 'Pack (embalado)' },
]

export default function OrderForm({ suppliers, onSubmit, onCancel }: Props) {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    api.get('/products').then((r) => setProducts(r.data)).catch(() => {})
  }, [])

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RawFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      supplierId: '',
      items: [{ productId: '', orderedUnit: 'MAPLE', orderedQuantity: '1', quotedUnitCost: '0' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">

      {/* Proveedor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
        <select
          {...register('supplierId')}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-sm outline-none
            focus:ring-2 focus:ring-primary-400"
        >
          <option value="">Selecciona un proveedor</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {errors.supplierId && (
          <p className="mt-1 text-xs text-red-500">{errors.supplierId.message}</p>
        )}
      </div>

      {/* Fecha esperada */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha esperada de entrega
        </label>
        <input
          type="date"
          {...register('expectedDeliveryDate')}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-sm outline-none
            focus:ring-2 focus:ring-primary-400"
        />
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <input
          {...register('notes')}
          placeholder="Pedido semanal..."
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-sm outline-none
            focus:ring-2 focus:ring-primary-400"
        />
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Productos *</label>
          <button
            type="button"
            onClick={() =>
              append({ productId: '', orderedUnit: 'MAPLE', orderedQuantity: '1', quotedUnitCost: '0' })
            }
            className="text-xs text-primary-600 font-semibold hover:underline"
          >
            + Agregar producto
          </button>
        </div>

        {errors.items?.root && (
          <p className="mb-2 text-xs text-red-500">{errors.items.root.message}</p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-500">
                  Producto {index + 1}
                </span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <select
                  {...register(`items.${index}.productId`)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm outline-none
                    focus:ring-2 focus:ring-primary-400"
                >
                  <option value="">Selecciona un producto</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <select
                  {...register(`items.${index}.orderedUnit`)}
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
                      {...register(`items.${index}.orderedQuantity`)}
                      placeholder="Cantidad"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm outline-none
                        focus:ring-2 focus:ring-primary-400"
                    />
                    {(errors.items as any)?.[index]?.orderedQuantity && (
                      <p className="mt-0.5 text-xs text-red-500">
                        {(errors.items as any)[index]?.orderedQuantity?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.quotedUnitCost`)}
                      placeholder="Costo unit."
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm outline-none
                        focus:ring-2 focus:ring-primary-400"
                    />
                    {(errors.items as any)?.[index]?.quotedUnitCost && (
                      <p className="mt-0.5 text-xs text-red-500">
                        {(errors.items as any)[index]?.quotedUnitCost?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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
          {isSubmitting ? 'Creando...' : 'Crear pedido'}
        </button>
      </div>
    </form>
  )
}