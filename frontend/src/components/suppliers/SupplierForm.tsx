import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Supplier } from '../../types/supplier.types'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  initial?: Supplier
  onSubmit: (data: FormData) => Promise<void>
  onCancel: () => void
}

export default function SupplierForm({ initial, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? '',
      contactName: initial?.contactName ?? '',
      phone: initial?.phone ?? '',
      address: initial?.address ?? '',
      notes: initial?.notes ?? '',
    },
  })

  const fields = [
    { id: 'name', label: 'Nombre del proveedor *', placeholder: 'Granja El Sol', required: true },
    { id: 'contactName', label: 'Persona de contacto', placeholder: 'Carlos López' },
    { id: 'phone', label: 'Teléfono', placeholder: '70000000' },
    { id: 'address', label: 'Dirección', placeholder: 'Santa Cruz, Bolivia' },
    { id: 'notes', label: 'Notas', placeholder: 'Proveedor principal...' },
  ] as const

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field) => (
        <div key={field.id}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
          <input
            {...register(field.id)}
            placeholder={field.placeholder}
            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition
              focus:ring-2 focus:ring-primary-400 focus:border-primary-400
              ${errors[field.id] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'}`}
          />
          {errors[field.id] && (
            <p className="mt-1 text-xs text-red-500">{errors[field.id]?.message}</p>
          )}
        </div>
      ))}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300
            text-white text-sm font-semibold transition"
        >
          {isSubmitting ? 'Guardando...' : initial ? 'Actualizar' : 'Crear proveedor'}
        </button>
      </div>
    </form>
  )
}