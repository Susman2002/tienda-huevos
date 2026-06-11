import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSuppliers } from '../../hooks/useSuppliers'
import SupplierCard from '../../components/suppliers/SupplierCard'
import SupplierForm from '../../components/suppliers/SupplierForm'
import OrderForm from '../../components/suppliers/OrderForm'
import { ordersApi } from '../../api/suppliers.api'
import type { Supplier } from '../../types/supplier.types'

type Modal = 'none' | 'create-supplier' | 'edit-supplier' | 'create-order'

export default function SuppliersPage() {
  const navigate = useNavigate()
  const { suppliers, loading, error, createSupplier, updateSupplier, deleteSupplier } =
    useSuppliers()

  const [modal, setModal] = useState<Modal>('none')
  const [selected, setSelected] = useState<Supplier | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const showFeedback = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleCreateSupplier = async (data: any) => {
    await createSupplier(data)
    setModal('none')
    showFeedback('Proveedor creado correctamente ✅')
  }

  const handleEditSupplier = async (data: any) => {
    if (!selected) return
    await updateSupplier(selected.id, data)
    setModal('none')
    setSelected(null)
    showFeedback('Proveedor actualizado ✅')
  }

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('¿Eliminar este proveedor?')) return
    await deleteSupplier(id)
    showFeedback('Proveedor eliminado')
  }

  const handleCreateOrder = async (data: any) => {
    const order = await ordersApi.create(data)
    setModal('none')
    showFeedback('Pedido creado correctamente ✅')
    navigate(`/suppliers/orders/${order.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Proveedores</h1>
            <p className="text-xs text-gray-400">{suppliers.length} registrados</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModal('create-order')}
              className="px-3 py-2 text-sm font-medium rounded-xl bg-primary-100 text-primary-700
                hover:bg-primary-200 transition"
            >
              + Pedido
            </button>
            <button
              onClick={() => setModal('create-supplier')}
              className="px-3 py-2 text-sm font-medium rounded-xl bg-primary-500 text-white
                hover:bg-primary-600 transition"
            >
              + Proveedor
            </button>
          </div>
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

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {loading && (
          <div className="text-center py-12 text-gray-400">Cargando proveedores...</div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}
        {!loading && suppliers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🏭</p>
            <p className="text-gray-500 text-sm">No hay proveedores registrados</p>
            <button
              onClick={() => setModal('create-supplier')}
              className="mt-4 px-6 py-2 bg-primary-500 text-white text-sm font-medium rounded-xl
                hover:bg-primary-600 transition"
            >
              Agregar proveedor
            </button>
          </div>
        )}
        {suppliers.map((supplier) => (
          <SupplierCard
            key={supplier.id}
            supplier={supplier}
            onEdit={(s) => { setSelected(s); setModal('edit-supplier') }}
            onDelete={handleDeleteSupplier}
          />
        ))}
      </div>

      {/* Modals */}
      {(modal === 'create-supplier' || modal === 'edit-supplier') && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-gray-800 mb-4">
              {modal === 'edit-supplier' ? 'Editar proveedor' : 'Nuevo proveedor'}
            </h2>
            <SupplierForm
              initial={modal === 'edit-supplier' ? selected ?? undefined : undefined}
              onSubmit={modal === 'edit-supplier' ? handleEditSupplier : handleCreateSupplier}
              onCancel={() => { setModal('none'); setSelected(null) }}
            />
          </div>
        </div>
      )}

      {modal === 'create-order' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-gray-800 mb-4">Nuevo pedido</h2>
            <OrderForm
              suppliers={suppliers}
              onSubmit={handleCreateOrder}
              onCancel={() => setModal('none')}
            />
          </div>
        </div>
      )}
    </div>
  )
}