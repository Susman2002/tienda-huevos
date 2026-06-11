import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ordersApi } from '../../api/suppliers.api'
import ReceiveOrderForm from '../../components/suppliers/ReceiveOrderForm'
import PaymentForm from '../../components/suppliers/PaymentForm'
import type { SupplierOrder } from '../../types/supplier.types'

const statusLabel: Record<string, string> = {
  ORDERED: 'Pedido',
  PARTIALLY_RECEIVED: 'Recibido parcial',
  RECEIVED: 'Recibido',
  CANCELLED: 'Cancelado',
}

const statusColor: Record<string, string> = {
  ORDERED: 'bg-blue-100 text-blue-700',
  PARTIALLY_RECEIVED: 'bg-yellow-100 text-yellow-700',
  RECEIVED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
}

const paymentColor: Record<string, string> = {
  UNPAID: 'bg-red-100 text-red-600',
  PARTIAL: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
}

const paymentLabel: Record<string, string> = {
  UNPAID: 'Sin pagar',
  PARTIAL: 'Pago parcial',
  PAID: 'Pagado',
}

const unitLabel: Record<string, string> = {
  GROUP: 'Grupo',
  MAPLE: 'Maple',
  UNIT: 'Unidad',
  PACK: 'Pack',
}

type Modal = 'none' | 'receive' | 'payment'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [order, setOrder] = useState<SupplierOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<Modal>('none')
  const [feedback, setFeedback] = useState<string | null>(null)

  const fetchOrder = async () => {
    if (!id) return
    const data = await ordersApi.getById(id)
    setOrder(data)
  }

  useEffect(() => {
    fetchOrder().finally(() => setLoading(false))
  }, [id])

  const showFeedback = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleReceive = async (data: any) => {
    if (!id) return
    const updated = await ordersApi.receive(id, data)
    setOrder(updated)
    setModal('none')
    showFeedback('Recepción registrada ✅')
  }

  const handlePayment = async (data: any) => {
    if (!id) return
    await ordersApi.registerPayment(id, data)
    await fetchOrder()
    setModal('none')
    showFeedback('Pago registrado ✅')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Cargando pedido...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Pedido no encontrado</p>
      </div>
    )
  }

  const canReceive = order.status !== 'RECEIVED' && order.status !== 'CANCELLED'
  const canPay = order.paymentStatus !== 'PAID' && order.status !== 'CANCELLED'

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-800">Detalle del pedido</h1>
            <p className="text-xs text-gray-400">
              {order.supplier?.name} ·{' '}
              {new Date(order.orderedAt).toLocaleDateString('es-BO')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">

        {/* Feedback */}
        {feedback && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
            {feedback}
          </div>
        )}

        {/* Estado */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex gap-2 mb-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor[order.status]}`}>
              {statusLabel[order.status]}
            </span>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${paymentColor[order.paymentStatus]}`}>
              {paymentLabel[order.paymentStatus]}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total estimado</span>
              <span className="font-medium">Bs. {Number(order.orderedTotalEstimated).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total recibido</span>
              <span className="font-medium">Bs. {Number(order.receivedTotalActual).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Monto pagado</span>
              <span className="font-medium text-green-600">Bs. {Number(order.amountPaid).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-100 pt-2 mt-2">
              <span className="font-semibold text-gray-700">Saldo pendiente</span>
              <span className={`font-bold ${Number(order.balanceDue) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                Bs. {Number(order.balanceDue).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Productos del pedido</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-800">{item.product.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${item.lineStatus === 'RECEIVED'
                      ? 'bg-green-100 text-green-700'
                      : item.lineStatus === 'PARTIAL'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {item.lineStatus === 'RECEIVED' ? 'Recibido' : item.lineStatus === 'PARTIAL' ? 'Parcial' : 'Pendiente'}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                  <p>
                    Pedido: {item.orderedQuantity} {unitLabel[item.orderedUnit]} · Bs. {Number(item.quotedUnitCost).toFixed(2)}/u
                  </p>
                  {item.receivedQuantity && (
                    <p>
                      Recibido: {item.receivedQuantity} {unitLabel[item.receivedUnit ?? item.orderedUnit]} · Bs. {Number(item.receivedUnitCost ?? 0).toFixed(2)}/u
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagos */}
        {order.payments.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Pagos registrados</h2>
            <div className="space-y-2">
              {order.payments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Bs. {Number(payment.amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">
                      {payment.method} · {new Date(payment.paymentDate).toLocaleDateString('es-BO')}
                    </p>
                  </div>
                  {payment.reference && (
                    <span className="text-xs text-gray-400">{payment.reference}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3 pb-6">
          {canReceive && (
            <button
              onClick={() => setModal('receive')}
              className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white
                text-sm font-semibold transition"
            >
              📦 Recibir
            </button>
          )}
          {canPay && (
            <button
              onClick={() => setModal('payment')}
              className="flex-1 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white
                text-sm font-semibold transition"
            >
              💵 Pagar
            </button>
          )}
        </div>
      </div>

      {/* Modal recepción */}
      {modal === 'receive' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-gray-800 mb-4">Registrar recepción</h2>
            <ReceiveOrderForm
              orderItems={order.items}
              onSubmit={handleReceive}
              onCancel={() => setModal('none')}
            />
          </div>
        </div>
      )}

      {/* Modal pago */}
      {modal === 'payment' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-gray-800 mb-4">Registrar pago</h2>
            <PaymentForm
              balanceDue={Number(order.balanceDue)}
              onSubmit={handlePayment}
              onCancel={() => setModal('none')}
            />
          </div>
        </div>
      )}
    </div>
  )
}