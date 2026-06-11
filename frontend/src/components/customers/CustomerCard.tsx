import { Phone, MapPin, CreditCard, Trash2, Pencil, ChevronRight } from 'lucide-react'
import type { WholesaleCustomer } from '../../types/customer.types'

interface Props {
  customer: WholesaleCustomer
  onEdit: (c: WholesaleCustomer) => void
  onDelete: (c: WholesaleCustomer) => void
  onView: (id: string) => void
  isAdmin: boolean
}

export default function CustomerCard({ customer, onEdit, onDelete, onView, isAdmin }: Props) {
  const totalDebt = customer.sales?.reduce(
    (acc, s) => acc + parseFloat(s.balanceDue),
    0,
  ) ?? 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-mono text-gray-400">{customer.code}</span>
          <h3 className="font-semibold text-gray-800 leading-tight">{customer.businessName}</h3>
          {customer.contactName && (
            <p className="text-xs text-gray-500 mt-0.5">{customer.contactName}</p>
          )}
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
            customer.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {customer.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-1.5">
        {customer.phone && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Phone size={13} />
            <span>{customer.phone}</span>
          </div>
        )}
        {customer.address && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin size={13} />
            <span className="truncate">{customer.address}</span>
          </div>
        )}
        {customer.creditLimit && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <CreditCard size={13} />
            <span>Límite: Bs. {parseFloat(customer.creditLimit).toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Deuda */}
      {totalDebt > 0 && (
        <div className="rounded-lg bg-red-50 px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-red-600 font-medium">Deuda pendiente</span>
          <span className="text-sm font-bold text-red-700">Bs. {totalDebt.toFixed(2)}</span>
        </div>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
        <button
          onClick={() => onView(customer.id)}
          className="flex-1 flex items-center justify-center gap-1 text-xs text-primary-600 font-medium py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
        >
          Ver detalle <ChevronRight size={13} />
        </button>
        {isAdmin && (
          <>
            <button
              onClick={() => onEdit(customer)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => onDelete(customer)}
              className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}