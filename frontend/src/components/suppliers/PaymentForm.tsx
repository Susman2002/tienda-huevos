import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  amount: z
    .string()
    .min(1, 'Requerido')
    .transform((v) => parseFloat(v))
    .pipe(z.number().min(0.01, 'El monto debe ser mayor a 0')),
  method: z.enum(['CASH', 'TRANSFER', 'CHECK', 'OTHER']),
  reference: z.string().optional(),
  notes: z.string().optional(),
  paymentDate: z.string().optional(),
})

type RawFormData = {
  amount: string
  method: 'CASH' | 'TRANSFER' | 'CHECK' | 'OTHER'
  reference?: string
  notes?: string
  paymentDate?: string
}

type FormData = z.infer<typeof schema>

interface Props {
  balanceDue: number
  onSubmit: (data: FormData) => Promise<void>
  onCancel: () => void
}

const methodOptions = [
  { value: 'CASH', label: '💵 Efectivo' },
  { value: 'TRANSFER', label: '🏦 Transferencia' },
  { value: 'CHECK', label: '📄 Cheque' },
  { value: 'OTHER', label: '🔄 Otro' },
]

export default function PaymentForm({ balanceDue, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RawFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      amount: String(balanceDue),
      method: 'CASH',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">

      <div className="bg-primary-50 rounded-xl p-3 text-center">
        <p className="text-xs text-primary-600">Saldo pendiente</p>
        <p className="text-2xl font-bold text-primary-700">
          Bs. {balanceDue.toFixed(2)}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Monto a pagar *</label>
        <input
          type="number"
          step="0.01"
          {...register('amount')}
          className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition
            focus:ring-2 focus:ring-primary-400
            ${errors.amount ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'}`}
        />
        {errors.amount && (
          <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago *</label>
        <div className="grid grid-cols-2 gap-2">
          {methodOptions.map((m) => (
            <label
              key={m.value}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200
                bg-gray-50 cursor-pointer has-[:checked]:border-primary-400
                has-[:checked]:bg-primary-50 transition"
            >
              <input
                type="radio"
                value={m.value}
                {...register('method')}
                className="accent-primary-500"
              />
              <span className="text-sm">{m.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Referencia / Comprobante
        </label>
        <input
          {...register('reference')}
          placeholder="Nro. de transferencia, cheque..."
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-sm outline-none
            focus:ring-2 focus:ring-primary-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de pago</label>
        <input
          type="date"
          {...register('paymentDate')}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-sm outline-none
            focus:ring-2 focus:ring-primary-400"
        />
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
          {isSubmitting ? 'Registrando...' : 'Registrar pago'}
        </button>
      </div>
    </form>
  )
}