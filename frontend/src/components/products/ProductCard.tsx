import { useState } from 'react'
import { Package, Tag, ToggleLeft, ToggleRight, Pencil } from 'lucide-react'
import type { Product } from '../../types/product.types'
import { FAMILY_LABELS, GRADE_LABELS, PACK_LABELS, FAMILY_COLORS } from '../../types/product.types'

interface Props {
  product: Product
  onEdit: (product: Product) => void
  onToggle: (id: string) => Promise<void>
}

export default function ProductCard({ product, onEdit, onToggle }: Props) {
  const [toggling, setToggling] = useState(false)

  const handleToggle = async () => {
    setToggling(true)
    try { await onToggle(product.id) }
    finally { setToggling(false) }
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-4 transition
      ${product.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
            <Package size={18} className="text-primary-500" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">{product.name}</p>
            <p className="text-xs text-gray-400 font-mono">{product.sku}</p>
          </div>
        </div>

        {/* Familia badge */}
        <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0
          ${FAMILY_COLORS[product.family]}`}>
          {FAMILY_LABELS[product.family]}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-1 mb-4">
        {product.grade && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Tag size={12} />
            <span>Grado: <span className="font-medium text-gray-700">{GRADE_LABELS[product.grade]}</span></span>
          </div>
        )}
        {product.packSize && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Package size={12} />
            <span>Pack: <span className="font-medium text-gray-700">{PACK_LABELS[product.packSize]}</span></span>
          </div>
        )}
        {product.unitsPerPack && (
          <div className="text-xs text-gray-500">
            Unidades por pack: <span className="font-medium text-gray-700">{product.unitsPerPack}</span>
          </div>
        )}
        {product.notes && (
          <p className="text-xs text-gray-400 italic truncate">{product.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(product)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
            border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition"
        >
          <Pencil size={13} />
          Editar
        </button>
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
            text-xs font-medium transition disabled:opacity-50
            ${product.isActive
              ? 'border border-red-200 text-red-500 hover:bg-red-50'
              : 'border border-green-200 text-green-600 hover:bg-green-50'}`}
        >
          {product.isActive
            ? <><ToggleLeft size={13} /> Desactivar</>
            : <><ToggleRight size={13} /> Activar</>}
        </button>
      </div>
    </div>
  )
}