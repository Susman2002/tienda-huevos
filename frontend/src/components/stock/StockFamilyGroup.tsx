import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, SlidersHorizontal, History } from 'lucide-react'
import StockAlertBadge from './StockAlertBadge'
import type { ProductWithStock } from '../../types/stock.types'

const FAMILY_LABELS: Record<string, string> = {
  NORMAL: '🥚 Huevos Normales',
  WHITE: '🤍 Huevos Blancos',
  PACKAGED: '📦 Empaquetados',
}

interface Props {
  family: string
  products: ProductWithStock[]
  onAdjust: (product: ProductWithStock) => void
}

export default function StockFamilyGroup({ family, products, onAdjust }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  if (products.length === 0) return null

  const totalUnits = products.reduce((s, p) => s + (p.stock?.onHand ?? 0), 0)
  const alerts = products.filter((p) => (p.stock?.onHand ?? 0) < p.alertThreshold).length

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-800 text-sm">
            {FAMILY_LABELS[family] ?? family}
          </span>
          <span className="text-xs text-gray-500">
            {products.length} productos · {totalUnits.toLocaleString()} uds
          </span>
          {alerts > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
              {alerts} alerta{alerts > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>

      {/* Table */}
      {!collapsed && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-2 text-left">Producto</th>
                <th className="px-4 py-2 text-right">En stock</th>
                <th className="px-4 py-2 text-right">Umbral</th>
                <th className="px-4 py-2 text-center">Estado</th>
                <th className="px-4 py-2 text-right">Costo prom.</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{product.name}</div>
                    <div className="text-xs text-gray-400">{product.sku}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">
                    {(product.stock?.onHand ?? 0).toLocaleString()}
                    <span className="ml-1 text-xs text-gray-400">
                      {product.baseStockUnit === 'PACK' ? 'packs' : 'uds'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {product.alertThreshold.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StockAlertBadge
                      onHand={product.stock?.onHand ?? 0}
                      threshold={product.alertThreshold}
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {product.stock
                      ? `Bs ${parseFloat(product.stock.averageUnitCost).toFixed(2)}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onAdjust(product)}
                        title="Ajustar stock"
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      >
                        <SlidersHorizontal size={15} />
                      </button>
                      <button
                        onClick={() => navigate(`/stock/${product.id}/movements`)}
                        title="Ver movimientos"
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      >
                        <History size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}