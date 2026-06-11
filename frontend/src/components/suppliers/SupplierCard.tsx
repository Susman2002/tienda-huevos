import { useNavigate } from 'react-router-dom'
import type { Supplier } from '../../types/supplier.types'

interface Props {
  supplier: Supplier
  onEdit: (supplier: Supplier) => void
  onDelete: (id: string) => void
}

export default function SupplierCard({ supplier, onEdit, onDelete }: Props) {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 truncate">{supplier.name}</h3>
          {supplier.contactName && (
            <p className="text-sm text-gray-500 mt-0.5">👤 {supplier.contactName}</p>
          )}
          {supplier.phone && (
            <p className="text-sm text-gray-500">📞 {supplier.phone}</p>
          )}
          {supplier.address && (
            <p className="text-sm text-gray-400 truncate">📍 {supplier.address}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => navigate(`/suppliers/${supplier.id}`)}
          className="flex-1 py-2 text-sm font-medium rounded-xl bg-primary-50 text-primary-700
            hover:bg-primary-100 transition"
        >
          Ver pedidos
        </button>
        <button
          onClick={() => onEdit(supplier)}
          className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-100 text-gray-600
            hover:bg-gray-200 transition"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(supplier.id)}
          className="px-4 py-2 text-sm font-medium rounded-xl bg-red-50 text-red-500
            hover:bg-red-100 transition"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}