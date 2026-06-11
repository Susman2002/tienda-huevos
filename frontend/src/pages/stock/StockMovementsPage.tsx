import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { useStockMovements } from '../../hooks/useStock'
import StockAlertBadge from '../../components/stock/StockAlertBadge'

const TYPE_LABELS: Record<string, string> = {
  INITIAL_STOCK: 'Stock inicial',
  PURCHASE_RECEIPT: 'Recepción de pedido',
  WHOLESALE_SALE: 'Venta mayorista',
  RETAIL_SALE: 'Venta minorista',
  ADJUSTMENT: 'Ajuste manual',
  RETURN_IN: 'Devolución entrada',
  RETURN_OUT: 'Devolución salida',
}

export default function StockMovementsPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { product, movements, loading, error, fetch } = useStockMovements(productId!)

  useEffect(() => { fetch() }, [fetch])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/stock')}
          className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">
            {product?.name ?? 'Movimientos'}
          </h1>
          <p className="text-xs text-gray-500">{product?.sku}</p>
        </div>
        {product && (
          <StockAlertBadge
            onHand={product.stock?.onHand ?? 0}
            threshold={product.alertThreshold}
          />
        )}
      </div>

      {/* Stock actual */}
      {product && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">En stock</p>
            <p className="text-2xl font-bold text-gray-800">
              {(product.stock?.onHand ?? 0).toLocaleString()}
              <span className="ml-1 text-sm font-normal text-gray-400">
                {product.baseStockUnit === 'PACK' ? 'packs' : 'uds'}
              </span>
            </p>
          </div>
          <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Costo promedio</p>
            <p className="text-2xl font-bold text-gray-800">
              Bs {parseFloat(product.stock?.averageUnitCost ?? '0').toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      {/* Lista de movimientos */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">
          Últimos {movements.length} movimientos
        </h2>

        {movements.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
            Sin movimientos registrados
          </div>
        )}

        {movements.map((mov) => (
          <div
            key={mov.id}
            className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
          >
            {/* Icono dirección */}
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                mov.direction === 'IN'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {mov.direction === 'IN' ? (
                <TrendingUp size={15} />
              ) : (
                <TrendingDown size={15} />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-800">
                  {TYPE_LABELS[mov.type] ?? mov.type}
                </span>
                <span
                  className={`text-sm font-bold ${
                    mov.direction === 'IN' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {mov.direction === 'IN' ? '+' : '-'}
                  {mov.quantity.toLocaleString()}
                </span>
              </div>
              {mov.note && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">{mov.note}</p>
              )}
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span>
                  Stock después: <strong className="text-gray-600">{mov.stockAfter.toLocaleString()}</strong>
                </span>
                {mov.createdBy && <span>· {mov.createdBy.name}</span>}
                <span>
                  · {new Date(mov.occurredAt).toLocaleDateString('es-BO', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}