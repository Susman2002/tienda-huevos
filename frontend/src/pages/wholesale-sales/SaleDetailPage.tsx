import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wholesaleSalesApi } from '../../api/wholesale-sales.api'
import type { SaleStatus, PaymentMethod, RegisterPaymentDto } from '../../types/wholesale-sales.types'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Package,
  CreditCard,
  Loader2,
  X,
} from 'lucide-react'

const STATUS_LABEL: Record<SaleStatus, string> = {
  PENDING: 'Pendiente',
  PARTIAL: 'Parcial',
  PAID: 'Pagado',
  CANCELLED: 'Cancelado',
}

const STATUS_STYLE: Record<SaleStatus, string> = {
  PENDING: 'bg-red-100 text-red-700',
  PARTIAL: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
}

const STATUS_ICON: Record<SaleStatus, React.ReactNode> = {
  PENDING: <Clock size={14} />,
  PARTIAL: <AlertCircle size={14} />,
  PAID: <CheckCircle size={14} />,
  CANCELLED: <XCircle size={14} />,
}

const UNIT_LABEL: Record<string, string> = {
  GROUP: 'Grupo',
  MAPLE: 'Maple',
  UNIT: 'Unidad',
  PACK: 'Pack',
}

const METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
  CHECK: 'Cheque',
  OTHER: 'Otro',
}

function formatCurrency(value: string | number) {
  return `Bs. ${Number(value).toFixed(2)}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Modal de pago ──────────────────────────────────────────────
function PaymentModal({
  saleId,
  balanceDue,
  onClose,
}: {
  saleId: string
  balanceDue: string
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('CASH')
  const [reference, setReference] = useState('')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: (dto: RegisterPaymentDto) =>
      wholesaleSalesApi.registerPayment(saleId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesale-sale', saleId] })
      queryClient.invalidateQueries({ queryKey: ['wholesale-sales'] })
      onClose()
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? 'Error al registrar pago')
    },
  })

  const handleSubmit = () => {
    setError('')
    const num = parseFloat(amount)
    if (!amount || isNaN(num) || num <= 0) {
      setError('Ingresa un monto válido')
      return
    }
    if (num > parseFloat(balanceDue)) {
      setError(`El monto no puede superar el saldo: ${formatCurrency(balanceDue)}`)
      return
    }
    mutation.mutate({
      amount: num.toFixed(2),
      method,
      reference: reference || undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Registrar pago</h2>
          <button onClick={onClose} className="p-1 text-gray-400">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Saldo pendiente:{' '}
          <span className="font-bold text-red-600">{formatCurrency(balanceDue)}</span>
        </p>

        {/* Monto */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Monto (Bs.)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Método */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Método de pago
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['CASH', 'TRANSFER', 'CHECK', 'OTHER'] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  method === m
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {METHOD_LABEL[m]}
              </button>
            ))}
          </div>
        </div>

        {/* Referencia */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Referencia (opcional)
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Nro. transferencia, cheque..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="w-full bg-primary-600 text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {mutation.isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <CreditCard size={18} />
          )}
          Confirmar pago
        </button>
      </div>
    </div>
  )
}

// ─── Página detalle ─────────────────────────────────────────────
export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const { data: sale, isLoading, isError } = useQuery({
    queryKey: ['wholesale-sale', id],
    queryFn: () => wholesaleSalesApi.getOne(id!),
    enabled: !!id,
  })

  const cancelMutation = useMutation({
    mutationFn: () => wholesaleSalesApi.cancel(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesale-sale', id] })
      queryClient.invalidateQueries({ queryKey: ['wholesale-sales'] })
      setShowCancelConfirm(false)
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-primary-600" size={36} />
      </div>
    )
  }

  if (isError || !sale) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-red-500">
        <AlertCircle size={40} />
        <p>No se pudo cargar la venta</p>
        <button onClick={() => navigate(-1)} className="text-primary-600 text-sm">
          Volver
        </button>
      </div>
    )
  }

  const canPay = sale.status === 'PENDING' || sale.status === 'PARTIAL'
  const canCancel = sale.status === 'PENDING' || sale.status === 'PARTIAL'

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-500 text-sm mb-4"
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">{formatDate(sale.saleDate)}</p>
            <h1 className="text-xl font-bold text-gray-900">
              {sale.customer.businessName}
            </h1>
            <p className="text-sm text-gray-500">{sale.customer.code}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium ${STATUS_STYLE[sale.status]}`}
          >
            {STATUS_ICON[sale.status]}
            {STATUS_LABEL[sale.status]}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Resumen financiero */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Resumen</h2>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total venta</span>
              <span className="font-bold text-gray-900">{formatCurrency(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Pagado</span>
              <span className="font-semibold text-green-600">{formatCurrency(sale.amountPaid)}</span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Saldo pendiente</span>
              <span className={`font-bold ${Number(sale.balanceDue) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(sale.balanceDue)}
              </span>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Package size={15} />
            Productos ({sale.items.length})
          </h2>
          <div className="flex flex-col gap-3">
            {sale.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {item.quantity} {UNIT_LABEL[item.saleUnit]} · {item.baseQuantity} uds base
                  </p>
                  <p className="text-xs text-gray-400">
                    Precio: {formatCurrency(item.unitPrice)} / ud base
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagos registrados */}
        {sale.paymentAllocations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <CreditCard size={15} />
              Pagos registrados
            </h2>
            <div className="flex flex-col gap-3">
              {sale.paymentAllocations.map((alloc) => (
                <div key={alloc.id} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {METHOD_LABEL[alloc.payment.method]}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(alloc.payment.paymentDate)} · {alloc.payment.registeredBy.name}
                    </p>
                    {alloc.payment.reference && (
                      <p className="text-xs text-gray-400">Ref: {alloc.payment.reference}</p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-green-600 shrink-0">
                    {formatCurrency(alloc.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Creado por */}
        <p className="text-xs text-center text-gray-400">
          Registrado por {sale.createdBy.name}
        </p>
      </div>

      {/* Acciones */}
      {(canPay || canCancel) && (
        <div className="bg-white border-t border-gray-100 px-4 py-4 flex gap-3">
          {canCancel && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="flex-1 border border-red-200 text-red-600 font-semibold py-3 rounded-2xl text-sm"
            >
              Cancelar venta
            </button>
          )}
          {canPay && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex-1 bg-primary-600 text-white font-semibold py-3 rounded-2xl text-sm flex items-center justify-center gap-2"
            >
              <CreditCard size={16} />
              Registrar pago
            </button>
          )}
        </div>
      )}

      {/* Modal pago */}
      {showPaymentModal && (
        <PaymentModal
          saleId={sale.id}
          balanceDue={sale.balanceDue}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* Confirm cancelar */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">¿Cancelar venta?</h2>
            <p className="text-sm text-gray-500">
              El stock de los productos será devuelto. Esta acción no se puede deshacer.
            </p>
            {cancelMutation.isError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">
                {(cancelMutation.error as any)?.response?.data?.message ?? 'Error al cancelar'}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-2xl text-sm"
              >
                No, volver
              </button>
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="flex-1 bg-red-600 text-white font-semibold py-3 rounded-2xl text-sm flex items-center justify-center gap-2"
              >
                {cancelMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Sí, cancelar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}