import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { suppliersApi, ordersApi } from '../../api/suppliers.api'
import OrderCard from '../../components/suppliers/OrderCard'
import OrderForm from '../../components/suppliers/OrderForm'
import type { Supplier, SupplierOrder } from '../../types/supplier.types'

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [orders, setOrders] = useState<SupplierOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([
  suppliersApi.getById(id),
  ordersApi.getBySupplier(id),  // ✅ endpoint dedicado
]).then(([sup, supplierOrders]) => {
  setSupplier(sup)
  setOrders(supplierOrders)
}).finally(() => setLoading(false))
  }, [id])

  const handleCreateOrder = async (data: any) => {
    const order = await ordersApi.create({ ...data, supplierId: id! })
    setShowOrderForm(false)
    setFeedback('Pedido creado ✅')
    setTimeout(() => setFeedback(null), 3000)
    navigate(`/suppliers/orders/${order.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Proveedor no encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/suppliers')}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-800 truncate">{supplier.name}</h1>
            {supplier.phone && (
              <p className="text-xs text-gray-400">📞 {supplier.phone}</p>
            )}
          </div>
          <button
            onClick={() => setShowOrderForm(true)}
            className="px-3 py-2 text-sm font-medium rounded-xl bg-primary-500 text-white
              hover:bg-primary-600 transition"
          >
            + Pedido
          </button>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="max-w-lg mx-auto px-4 pt-3">
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
            {feedback}
          </div>
        </div>
      )}

      {/* Orders */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        <p className="text-sm font-medium text-gray-500">
          {orders.length} pedido(s) registrado(s)
        </p>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-500 text-sm">No hay pedidos para este proveedor</p>
          </div>
        )}

        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {/* Modal nuevo pedido */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-gray-800 mb-4">Nuevo pedido</h2>
            <OrderForm
              suppliers={[supplier]}
              onSubmit={handleCreateOrder}
              onCancel={() => setShowOrderForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}