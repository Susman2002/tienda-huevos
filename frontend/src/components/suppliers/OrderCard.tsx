import { useNavigate } from 'react-router-dom'
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

interface Props {
  order: SupplierOrder
}

export default function OrderCard({ order }: Props) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/suppliers/orders/${order.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 cursor-pointer
        hover:shadow-md transition active:scale-[0.99]"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs text-gray-400">
          {new Date(order.orderedAt).toLocaleDateString('es-BO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
        <div className="flex gap-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor[order.status]}`}>
            {statusLabel[order.status]}
          </span>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${paymentColor[order.paymentStatus]}`}>
            {paymentLabel[order.paymentStatus]}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total estimado</span>
          <span className="font-medium text-gray-800">
            Bs. {Number(order.orderedTotalEstimated).toFixed(2)}
          </span>
        </div>
        {Number(order.receivedTotalActual) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total recibido</span>
            <span className="font-medium text-gray-800">
              Bs. {Number(order.receivedTotalActual).toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Saldo pendiente</span>
          <span className={`font-semibold ${Number(order.balanceDue) > 0 ? 'text-red-500' : 'text-green-600'}`}>
            Bs. {Number(order.balanceDue).toFixed(2)}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        {order.items?.length ?? 0} producto(s) en el pedido
      </p>
    </div>
  )
}