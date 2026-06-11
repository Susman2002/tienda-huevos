import { useEffect } from 'react'
import { RotateCcw, UserX, ShieldAlert } from 'lucide-react'
import { useCustomers } from '../../hooks/useCustomers'

export default function DeletedCustomersList() {
  const { deleted, loading, fetchDeleted, restore } = useCustomers()

  useEffect(() => {
    fetchDeleted()
  }, [fetchDeleted])

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (deleted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
        <UserX size={36} />
        <p className="text-sm">No hay clientes eliminados</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {deleted.map((c) => (
        <div
          key={c.id}
          className="bg-white rounded-2xl border border-red-100 p-4 flex flex-col gap-2"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-mono text-gray-400">{c.code}</span>
              <h3 className="font-semibold text-gray-700">{c.businessName}</h3>
              {c.contactName && (
                <p className="text-xs text-gray-400">{c.contactName}</p>
              )}
            </div>
            <button
              onClick={() => restore(c.id)}
              className="flex items-center gap-1 text-xs text-primary-600 font-medium px-3 py-1.5 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors shrink-0"
            >
              <RotateCcw size={13} />
              Restaurar
            </button>
          </div>

          {/* Auditoría */}
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
            <ShieldAlert size={14} className="text-red-500 shrink-0" />
            <div className="text-xs text-red-700">
              <span className="font-medium">
                Eliminado el{' '}
                {new Date(c.deletedAt).toLocaleDateString('es-BO', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              {c.deletedBy && (
                <span className="text-red-500"> · por {c.deletedBy.name}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}