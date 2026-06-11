import { useEffect, useState } from 'react'
import { RefreshCw, AlertTriangle, Package } from 'lucide-react'
import { useStock } from '../../hooks/useStock'
import StockFamilyGroup from '../../components/stock/StockFamilyGroup'
import AdjustStockModal from '../../components/stock/AdjustStockModal'
import type { ProductWithStock } from '../../types/stock.types'

export default function StockPage() {
  const { data, loading, error, fetchAll, adjust } = useStock()
  const [selectedProduct, setSelectedProduct] = useState<ProductWithStock | null>(null)

  useEffect(() => { fetchAll() }, [fetchAll])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-red-500">
        <AlertTriangle size={32} />
        <p className="text-sm">{error}</p>
        <button onClick={fetchAll} className="text-sm underline">Reintentar</button>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Stock</h1>
          <p className="text-sm text-gray-500 mt-0.5">Inventario en tiempo real</p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={15} />
          Actualizar
        </button>
      </div>

      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Productos activos</p>
            <p className="text-2xl font-bold text-gray-800">{data.summary.totalProducts}</p>
          </div>
          <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Total unidades</p>
            <p className="text-2xl font-bold text-gray-800">
              {data.summary.totalUnits.toLocaleString()}
            </p>
          </div>
          <div
            className={`rounded-xl border p-4 shadow-sm ${
              data.summary.belowAlert > 0
                ? 'bg-red-50 border-red-200'
                : 'bg-green-50 border-green-200'
            }`}
          >
            <p className="text-xs text-gray-500 mb-1">Alertas</p>
            <p
              className={`text-2xl font-bold ${
                data.summary.belowAlert > 0 ? 'text-red-700' : 'text-green-700'
              }`}
            >
              {data.summary.belowAlert}
            </p>
          </div>
        </div>
      )}

      {/* Sin datos */}
      {!data && (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
          <Package size={40} />
          <p className="text-sm">No hay productos activos</p>
        </div>
      )}

      {/* Grupos por familia */}
      {data && (
        <div className="space-y-4">
          {(['NORMAL', 'WHITE', 'PACKAGED'] as const).map((family) => (
            <StockFamilyGroup
              key={family}
              family={family}
              products={data[family]}
              onAdjust={setSelectedProduct}
            />
          ))}
        </div>
      )}

      {/* Modal ajuste */}
      <AdjustStockModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onConfirm={adjust}
      />
    </div>
  )
}