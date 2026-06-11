import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
//import type { Product } from '../../types/product.types'
import type { Product, CreateProductData } from '../../types/product.types'

// 1. Definimos el esquema limpio (sin transformaciones raras)
const schema = z.object({
  sku: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[A-Z0-9\-_]+$/i, 'Solo letras, números, - y _'),

  name: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),

  // Corregido: Usamos 'message' directo en lugar de 'errorMap'
  family: z.enum(['NORMAL', 'WHITE', 'PACKAGED'], {
    message: 'Selecciona una familia',
  }),

  baseStockUnit: z.enum(['EGG', 'PACK'], {
    message: 'Selecciona la unidad base',
  }),

  grade: z.enum(['EXTRA', 'ESPECIAL', 'PRIMERA', 'SEGUNDA', 'TERCERA', 'CUARTA', 'QUINTA'])
    .optional()
    .or(z.literal('')),

  packSize: z.enum(['P30', 'P20', 'P10', 'P6'])
    .optional()
    .or(z.literal('')),

  // Validamos que sea un string numérico antes de enviarlo
  unitsPerPack: z
    .string()
    .optional()
    .refine(v => !v || /^\d+$/.test(v), { message: 'Debe ser un número entero' }),

  notes: z
    .string()
    .max(500, 'Máximo 500 caracteres')
    .optional()
    .or(z.literal('')),

  isActive: z.boolean().optional(),
})

// Este es el tipo exacto de los datos dentro del formulario HTML
type FormData = z.infer<typeof schema>

interface Props {
  initial?: Product
  onSubmit: (data: CreateProductData) => Promise<void>
  onCancel: () => void
}

export default function ProductForm({ initial, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sku: initial?.sku ?? '',
      name: initial?.name ?? '',
      family: (initial?.family as any) ?? 'NORMAL',
      baseStockUnit: (initial?.baseStockUnit as any) ?? 'EGG',
      grade: (initial?.grade as any) ?? '',
      packSize: (initial?.packSize as any) ?? '',
      // Si viene un número del backend/padre, lo convertimos a string para el input
      unitsPerPack: initial?.unitsPerPack ? String(initial.unitsPerPack) : '',
      notes: initial?.notes ?? '',
      isActive: initial?.isActive ?? true,
    },
  })

  const family = watch('family')

  // 2. Esta función intermedia procesa los datos antes de mandarlos al padre
  const onLocalSubmit = async (values: FormData) => {
  const payload: CreateProductData = {
    sku: values.sku,
    name: values.name,
    family: values.family,
    baseStockUnit: values.baseStockUnit,
    grade: (values.grade as CreateProductData['grade']) || undefined,
    packSize: (values.packSize as CreateProductData['packSize']) || undefined,
    unitsPerPack: values.unitsPerPack ? parseInt(values.unitsPerPack, 10) : undefined,
    notes: values.notes || undefined,
    isActive: values.isActive ?? true,
  }
  await onSubmit(payload)
}

  return (
    <form onSubmit={handleSubmit(onLocalSubmit)} className="space-y-4">

      {/* SKU + Nombre */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
          <input
            {...register('sku')}
            placeholder="HNE-001"
            className={`w-full px-3 py-3 rounded-xl border text-sm outline-none transition
              focus:ring-2 focus:ring-primary-400
              ${errors.sku ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'}`}
          />
          {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            {...register('name')}
            placeholder="Huevo Extra"
            className={`w-full px-3 py-3 rounded-xl border text-sm outline-none transition
              focus:ring-2 focus:ring-primary-400
              ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'}`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
      </div>

      {/* Familia */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Familia *</label>
        <select
          {...register('family')}
          className={`w-full px-3 py-3 rounded-xl border text-sm outline-none transition
            focus:ring-2 focus:ring-primary-400
            ${errors.family ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'}`}
        >
          <option value="NORMAL">Normal</option>
          <option value="WHITE">Blanco</option>
          <option value="PACKAGED">Empaquetado</option>
        </select>
        {errors.family && <p className="mt-1 text-xs text-red-500">{errors.family.message}</p>}
      </div>

      {/* Unidad base */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Unidad base *</label>
        <select
          {...register('baseStockUnit')}
          className={`w-full px-3 py-3 rounded-xl border text-sm outline-none transition
            focus:ring-2 focus:ring-primary-400
            ${errors.baseStockUnit ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'}`}
        >
          <option value="EGG">Huevo (unidad)</option>
          <option value="PACK">Pack</option>
        </select>
        {errors.baseStockUnit && <p className="mt-1 text-xs text-red-500">{errors.baseStockUnit.message}</p>}
      </div>

      {/* Grado — solo si no es PACKAGED */}
      {family !== 'PACKAGED' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
          <select
            {...register('grade')}
            className="w-full px-3 py-3 rounded-xl border border-gray-300 bg-gray-50 text-sm outline-none
              focus:ring-2 focus:ring-primary-400 transition"
          >
            <option value="">Sin grado</option>
            <option value="EXTRA">Extra</option>
            <option value="ESPECIAL">Especial</option>
            <option value="PRIMERA">Primera</option>
            <option value="SEGUNDA">Segunda</option>
            <option value="TERCERA">Tercera</option>
            <option value="CUARTA">Cuarta</option>
            <option value="QUINTA">Quinta</option>
          </select>
        </div>
      )}

      {/* Pack size + unidades — solo si es PACKAGED */}
      {family === 'PACKAGED' && (
        <div className="grid grid-cols-2 gap-3">baseStockUnit
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño de pack</label>
            <select
              {...register('packSize')}
              className="w-full px-3 py-3 rounded-xl border border-gray-300 bg-gray-50 text-sm outline-none
                focus:ring-2 focus:ring-primary-400 transition"
            >
              <option value="">Seleccionar</option>
              <option value="P30">30 unidades</option>
              <option value="P20">20 unidades</option>
              <option value="P10">10 unidades</option>
              <option value="P6">6 unidades</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidades por pack</label>
            <input
              {...register('unitsPerPack')}
              type="number"
              min={1}
              placeholder="30"
              className="w-full px-3 py-3 rounded-xl border border-gray-300 bg-gray-50 text-sm outline-none
                focus:ring-2 focus:ring-primary-400 transition"
            />
          </div>
        </div>
      )}

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <input
          {...register('notes')}
          placeholder="Observaciones opcionales..."
          className="w-full px-3 py-3 rounded-xl border border-gray-300 bg-gray-50 text-sm outline-none
            focus:ring-2 focus:ring-primary-400 transition"
        />
        {errors.notes && <p className="mt-1 text-xs text-red-500">{errors.notes.message}</p>}
      </div>

      {/* Activo */}
      <div className="flex items-center gap-3 py-1">
        <input
          {...register('isActive')}
          type="checkbox"
          id="isActive"
          className="w-4 h-4 accent-primary-500"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">Producto activo</label>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 text-sm
            font-medium hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-600
            disabled:bg-primary-300 text-white text-sm font-semibold transition"
        >
          {isSubmitting ? 'Guardando...' : initial ? 'Actualizar' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}