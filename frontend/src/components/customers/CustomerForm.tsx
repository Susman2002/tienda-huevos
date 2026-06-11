import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import type { WholesaleCustomer } from '../../types/customer.types'

const schema = z.object({
  businessName: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/, 'Solo letras y espacios'),
  contactName: z
    .string()
    .max(100)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]*$/, 'Solo letras y espacios')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^\d*$/, 'Solo números')
    .min(7, 'Mínimo 7 dígitos')
    .max(8, 'Máximo 8 dígitos')
    .optional()
    .or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  documentNumber: z
    .string()
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9-]*$/, 'Solo letras, números y guiones')
    .optional()
    .or(z.literal('')),
  creditLimit: z
    .string()
    .regex(/^\d*\.?\d{0,2}$/, 'Ingresa un monto válido')
    .optional()
    .or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
})

type FormData = {
  businessName: string
  contactName?: string
  phone?: string
  address?: string
  documentNumber?: string
  creditLimit?: string
  notes?: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: FormData) => Promise<void>
  initial?: WholesaleCustomer | null
}

export default function CustomerForm({ open, onClose, onSubmit, initial }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) as any })

  useEffect(() => {
    if (open) {
      reset(
        initial
          ? {
              businessName: initial.businessName,
              contactName: initial.contactName ?? '',
              phone: initial.phone ?? '',
              address: initial.address ?? '',
              documentNumber: initial.documentNumber ?? '',
              creditLimit: initial.creditLimit ?? '',
              notes: '',
            }
          : {
              businessName: '',
              contactName: '',
              phone: '',
              address: '',
              documentNumber: '',
              creditLimit: '',
              notes: '',
            },
      )
    }
  }, [open, initial, reset])

  if (!open) return null

  const fields: {
    name: keyof FormData
    label: string
    placeholder: string
    type?: string
    required?: boolean
  }[] = [
    { name: 'businessName', label: 'Nombre del negocio *', placeholder: 'Ej: Distribuidora López', required: true },
    { name: 'contactName', label: 'Nombre de contacto', placeholder: 'Ej: Juan López' },
    { name: 'phone', label: 'Teléfono', placeholder: 'Ej: 70012345', type: 'tel' },
    { name: 'address', label: 'Dirección', placeholder: 'Ej: Av. Principal #123' },
    { name: 'documentNumber', label: 'NIT / CI', placeholder: 'Ej: 1234567' },
    { name: 'creditLimit', label: 'Límite de crédito (Bs.)', placeholder: 'Ej: 500.00', type: 'text' },
    { name: 'notes', label: 'Notas', placeholder: 'Observaciones adicionales...' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 shrink-0">
          <h2 className="font-semibold text-gray-800">
            {initial ? 'Editar cliente' : 'Nuevo cliente mayorista'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-y-auto px-5 py-4 space-y-4"
        >
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {f.label}
              </label>
                <input
  type={f.type ?? 'text'}
  placeholder={f.placeholder}
  {...register(f.name)}
  onKeyDown={(e) => {
    if (f.name === 'phone') {
      if (
        !/\d/.test(e.key) &&
        !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)
      ) {
        e.preventDefault()
      }
    }

    if (f.name === 'businessName' || f.name === 'contactName') {
      if (/\d/.test(e.key)) {
        e.preventDefault()
      }
    }
  }}
  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
/>
              {errors[f.name] && (
                <p className="mt-1 text-xs text-red-500">
                  {errors[f.name]?.message as string}
                </p>
              )}
            </div>
          ))}

          {/* Botones */}
          <div className="flex gap-3 pt-2 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Guardando...' : initial ? 'Guardar cambios' : 'Crear cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}