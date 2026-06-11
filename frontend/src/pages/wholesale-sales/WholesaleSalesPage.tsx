import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { wholesaleSalesApi } from '../../api/wholesale-sales.api'
import type { SaleStatus } from '../../types/wholesale-sales.types'
import {
  Users,
  ShoppingCart,
  Phone,
  AlertCircle,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
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
  PENDING: <Clock size={12} />,
  PARTIAL: <AlertCircle size={12} />,
  PAID: <CheckCircle size={12} />,
  CANCELLED: <XCircle size={12} />,
}

function formatCurrency(value: string | number) {
  return `Bs. ${Number(value).toFixed(2)}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Pestaña Clientes ───────────────────────────────────────────
function CustomersTab() {
  const navigate = useNavigate()
  const { data: customers, isLoading, isError } = useQuery({
    queryKey: ['wholesale-customers-active'],
    queryFn: wholesaleSalesApi.getActiveCustomers,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center py-20 text-red-500 gap-2">
        <AlertCircle size={32} />
        <p className="text-sm">Error al cargar clientes</p>
      </div>
    )
  }

  if (!customers?.length) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-400 gap-2">
        <Users size={40} />
        <p className="text-sm">No hay clientes activos</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {customers.map((c) => (
        <button
          key={c.id}
          onClick={() =>
            navigate('/wholesale-sales', {
              state: { tab: 'sales', customerId: c.id },
            })
          }
          className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-4 active:scale-95 transition-transform"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-400">{c.code}</span>
                {c.lastSaleStatus && (
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[c.lastSaleStatus]}`}
                  >
                    {STATUS_ICON[c.lastSaleStatus]}
                    {STATUS_LABEL[c.lastSaleStatus]}
                  </span>
                )}
              </div>
              <p className="font-semibold text-gray-800 truncate">{c.businessName}</p>
              {c.contactName && (
                <p className="text-sm text-gray-500 truncate">{c.contactName}</p>
              )}
              {c.phone && (
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <Phone size={11} />
                  {c.phone}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {c.totalDebt > 0 ? (
                <span className="text-sm font-bold text-red-600">
                  -{formatCurrency(c.totalDebt)}
                </span>
              ) : (
                <span className="text-sm font-bold text-green-600">Al día</span>
              )}
              {c.lastSaleDate && (
                <span className="text-xs text-gray-400">
                  {formatDate(c.lastSaleDate)}
                </span>
              )}
              <ChevronRight size={16} className="text-gray-300 mt-1" />
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

// ─── Pestaña Ventas ─────────────────────────────────────────────
function SalesTab({ initialCustomerId }: { initialCustomerId?: string }) {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<SaleStatus | ''>('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['wholesale-sales', statusFilter, page, initialCustomerId],
    queryFn: () =>
      wholesaleSalesApi.getAll({
        ...(statusFilter && { status: statusFilter }),
        ...(initialCustomerId && { customerId: initialCustomerId }),
        page,
        limit: 20,
      }),
  })

  const statuses: { value: SaleStatus | ''; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'PARTIAL', label: 'Parcial' },
    { value: 'PAID', label: 'Pagado' },
    { value: 'CANCELLED', label: 'Cancelado' },
  ]

  return (
    <div className="flex flex-col gap-3">
      {/* Filtros */}
      <div className="px-4 pt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => { setStatusFilter(s.value); setPage(1) }}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              statusFilter === s.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-3 px-4 pb-4">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center py-16 text-red-500 gap-2">
            <AlertCircle size={32} />
            <p className="text-sm">Error al cargar ventas</p>
          </div>
        )}

        {!isLoading && !isError && !data?.data.length && (
          <div className="flex flex-col items-center py-16 text-gray-400 gap-2">
            <ShoppingCart size={40} />
            <p className="text-sm">No hay ventas registradas</p>
          </div>
        )}

        {data?.data.map((sale) => (
          <button
            key={sale.id}
            onClick={() => navigate(`/wholesale-sales/${sale.id}`)}
            className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-4 active:scale-95 transition-transform"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[sale.status]}`}
                  >
                    {STATUS_ICON[sale.status]}
                    {STATUS_LABEL[sale.status]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {sale._count?.items ?? 0} producto{(sale._count?.items ?? 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="font-semibold text-gray-800 truncate">
                  {sale.customer.businessName}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDate(sale.saleDate)} · {sale.createdBy.name}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="font-bold text-gray-800">
                  {formatCurrency(sale.subtotal)}
                </span>
                {Number(sale.balanceDue) > 0 && (
                  <span className="text-xs text-red-500 font-medium">
                    Debe {formatCurrency(sale.balanceDue)}
                  </span>
                )}
                <ChevronRight size={16} className="text-gray-300 mt-1" />
              </div>
            </div>
          </button>
        ))}

        {/* Paginación */}
        {data && data.meta.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-sm text-primary-600 disabled:text-gray-300 font-medium"
            >
              ← Anterior
            </button>
            <span className="text-xs text-gray-400">
              {page} / {data.meta.totalPages}
            </span>
            <button
              disabled={page === data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-sm text-primary-600 disabled:text-gray-300 font-medium"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Página principal ───────────────────────────────────────────
export default function WholesaleSalesPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'customers' | 'sales'>('customers')

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Ventas Mayoristas</h1>
            <p className="text-sm text-gray-500">Clientes y pedidos</p>
          </div>
          <button
            onClick={() => navigate('/wholesale-sales/create')}
            className="flex items-center gap-1.5 bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-xl active:scale-95 transition-transform"
          >
            <Plus size={16} />
            Nueva venta
          </button>
        </div>

        {/* Tabs */}
        <div className="flex">
          {[
            { key: 'customers', label: 'Clientes', icon: <Users size={15} /> },
            { key: 'sales', label: 'Pedidos', icon: <ShoppingCart size={15} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'customers' | 'sales')}
              className={`flex items-center gap-1.5 flex-1 justify-center py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-400'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'customers' ? <CustomersTab /> : <SalesTab />}
      </div>
    </div>
  )
}