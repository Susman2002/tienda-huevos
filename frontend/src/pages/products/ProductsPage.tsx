import { useState } from 'react'
import { Plus, Search, Package, AlertCircle } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import ProductCard from '../../components/products/ProductCard'
import ProductForm from '../../components/products/ProductForm'
import type { Product, CreateProductData } from '../../types/product.types'
import { FAMILY_LABELS } from '../../types/product.types'
import type { ProductFamily } from '../../types/product.types'

type FilterFamily = ProductFamily | 'ALL'

export default function ProductsPage() {
  const { products, loading, error, createProduct, updateProduct, toggleProduct } = useProducts()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [filterFamily, setFilterFamily] = useState<FilterFamily>('ALL')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [formError, setFormError] = useState<string | null>(null)

  const filtered = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    const matchFamily = filterFamily === 'ALL' || p.family === filterFamily
    const matchActive =
      filterActive === 'all' ||
      (filterActive === 'active' && p.isActive) ||
      (filterActive === 'inactive' && !p.isActive)
    return matchSearch && matchFamily && matchActive
  })

  const handleSubmit = async (data: CreateProductData) => {
    setFormError(null)
    try {
      if (editing) {
        await updateProduct(editing.id, data)
      } else {
        await createProduct(data)
      }
      setShowForm(false)
      setEditing(null)
    } catch (e: any) {
      setFormError(e?.response?.data?.message ?? 'Error al guardar producto')
    }
  }

  const handleEdit = (product: Product) => {
    setEditing(product)
    setShowForm(true)
    setFormError(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    setFormError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Productos</h1>
            <p className="text-sm text-gray-500">{products.length} productos registrados</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditing(null); setFormError(null) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600
              text-white text-sm font-semibold rounded-xl transition shadow-sm"
          >
            <Plus size={16} />
            Nuevo
          </button>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 shadow-xl">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                {editing ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{formError}</p>
                </div>
              )}
              <ProductForm
                initial={editing ?? undefined}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </div>
          </div>
        )}

        {/* Búsqueda */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o SKU..."
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm
              outline-none focus:ring-2 focus:ring-primary-400 transition"
          />
        </div>

        {/* Filtros familia */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {(['ALL', 'NORMAL', 'WHITE', 'PACKAGED'] as FilterFamily[]).map(f => (
            <button
              key={f}
              onClick={() => setFilterFamily(f)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition
                ${filterFamily === f
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {f === 'ALL' ? 'Todos' : FAMILY_LABELS[f]}
            </button>
          ))}
          <div className="w-px bg-gray-200 mx-1 shrink-0" />
          {(['all', 'active', 'inactive'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterActive(s)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition
                ${filterActive === s
                  ? 'bg-gray-700 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {s === 'all' ? 'Todos' : s === 'active' ? 'Activos' : 'Inactivos'}
            </button>
          ))}
        </div>

        {/* Estados */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-2">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-12">
            <Package size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">
              {search || filterFamily !== 'ALL'
                ? 'Sin resultados para tu búsqueda'
                : 'No hay productos registrados'}
            </p>
          </div>
        )}

        {/* Lista */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onToggle={async (id) => { await toggleProduct(id) }}
            />
          ))}
        </div>

      </div>
    </div>
  )
}