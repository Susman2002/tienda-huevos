import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Users, Trash2 } from 'lucide-react'
import { useCustomers } from '../../hooks/useCustomers'
import { useAuthStore } from '../../store/auth.store'
import CustomerCard from '../../components/customers/CustomerCard'
import CustomerForm from '../../components/customers/CustomerForm'
import DeletedCustomersList from '../../components/customers/DeletedCustomersList'
import type { WholesaleCustomer } from '../../types/customer.types'

export default function CustomersPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  const { customers, loading, error, fetchAll, create, update, softDelete } = useCustomers()

  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<WholesaleCustomer | null>(null)
  const [showDeleted, setShowDeleted] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<WholesaleCustomer | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const filtered = customers.filter(
    (c) =>
      c.businessName.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.contactName ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  const handleSubmit = async (data: any) => {
    if (editing) {
      await update(editing.id, data)
    } else {
      await create(data)
    }
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleteError(null)
    try {
      await softDelete(confirmDelete.id)
      setConfirmDelete(null)
    } catch (e: any) {
      setDeleteError(
        e?.response?.data?.message ?? 'No se pudo eliminar el cliente',
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-primary-600" />
            <h1 className="font-bold text-gray-800 text-lg">Clientes Mayoristas</h1>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setShowDeleted(!showDeleted)}
                className={`p-2 rounded-lg border transition-colors ${
                  showDeleted
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Trash2 size={17} />
              </button>
            )}
            {isAdmin && !showDeleted && (
              <button
                onClick={() => { setEditing(null); setShowForm(true) }}
                className="flex items-center gap-1.5 bg-primary-600 text-white text-sm font-medium px-3 py-2 rounded-xl hover:bg-primary-700 transition-colors"
              >
                <Plus size={16} />
                Nuevo
              </button>
            )}
          </div>
        </div>

        {/* Buscador */}
        {!showDeleted && (
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        {/* Vista eliminados */}
        {showDeleted ? (
          <div>
            <p className="text-sm font-medium text-red-600 mb-3">
              Clientes eliminados (con auditoría)
            </p>
            <DeletedCustomersList />
          </div>
        ) : loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-center text-red-500 text-sm py-10">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <Users size={40} />
            <p className="text-sm">
              {search ? 'Sin resultados para tu búsqueda' : 'No hay clientes registrados'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((c) => (
              <CustomerCard
                key={c.id}
                customer={c}
                isAdmin={isAdmin}
                onView={(id) => navigate(`/customers/${id}`)}
                onEdit={(c) => { setEditing(c); setShowForm(true) }}
                onDelete={(c) => { setConfirmDelete(c); setDeleteError(null) }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal formulario */}
      <CustomerForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null) }}
        onSubmit={handleSubmit}
        initial={editing}
      />

      {/* Modal confirmar eliminación */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-5 space-y-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={22} className="text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-800">¿Eliminar cliente?</h3>
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">{confirmDelete.businessName}</span>{' '}
                será eliminado lógicamente. Podrás restaurarlo después.
              </p>
              {deleteError && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 w-full">
                  {deleteError}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setConfirmDelete(null); setDeleteError(null) }}
                className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}