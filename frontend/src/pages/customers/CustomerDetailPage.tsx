import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, MapPin, CreditCard, FileText, Calendar } from 'lucide-react'
import { useCustomerDetail } from '../../hooks/useCustomers'

const statusLabel: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  PARTIAL:   { label: 'Parcial',   color: 'bg-orange-100 text-orange-700' },
  PAID:      { label: 'Pagado',    color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500' },
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { customer, loading, error, fetch } = useCustomerDetail(id ?? '')

  useEffect(() => {
    fetch()
  }, [fetch])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <p className="text-red-500 text-sm">{error ?? 'Cliente no encontrado'}</p>
        <button onClick={() => navigate(-1)} className="text-primary-600 text-sm underline">
          Volver
        </button>
      </div>
    )
  }

  const totalDebt = customer.sales?.reduce(
    (acc, s) => acc + parseFloat(s.balanceDue),
    0,
  ) ?? 0

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-xs text-gray-400 font-mono">{customer.code}</p>
          <h1 className="font-bold text-gray-800 leading-tight">{customer.businessName}</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Info card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Información del cliente</h2>
          <div className="space-y-2">
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={15} className="text-gray-400" />
                {customer.phone}
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={15} className="text-gray-400" />
                {customer.address}
              </div>
            )}
            {customer.documentNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText size={15} className="text-gray-400" />
                NIT/CI: {customer.documentNumber}
              </div>
            )}
            {customer.creditLimit && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CreditCard size={15} className="text-gray-400" />
                Límite de crédito: Bs. {parseFloat(customer.creditLimit).toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {/* Deuda total */}
        {totalDebt > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-red-700">Deuda total pendiente</span>
            <span className="text-lg font-bold text-red-700">Bs. {totalDebt.toFixed(2)}</span>
          </div>
        )}

        {/* Ventas recientes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Últimas ventas</h2>
          {!customer.sales || customer.sales.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Sin ventas registradas</p>
          ) : (
            <div className="space-y-2">
              {customer.sales.map((s) => {
                const st = statusLabel[s.status] ?? { label: s.status, color: 'bg-gray-100 text-gray-500' }
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {new Date(s.saleDate).toLocaleDateString('es-BO', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-800">
                        Bs. {parseFloat(s.subtotal).toFixed(2)}
                      </p>
                      {parseFloat(s.balanceDue) > 0 && (
                        <p className="text-xs text-red-500">
                          Debe: Bs. {parseFloat(s.balanceDue).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}