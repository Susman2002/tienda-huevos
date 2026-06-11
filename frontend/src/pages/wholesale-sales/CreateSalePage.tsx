import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wholesaleSalesApi } from '../../api/wholesale-sales.api'
import api from '../../api/axios'
import type {
  ActiveCustomer,
  CreateSaleDto,
  CreateSaleItemDto,
  PaymentMethod,
  TransactionUnit,
  ProductFamily,
} from '../../types/wholesale-sales.types'
import {
  ArrowLeft,
  ChevronDown,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Package,
} from 'lucide-react'

interface ProductOption {
  id: string
  sku: string
  name: string
  family: ProductFamily
  stock?: { onHand: number }
}

const UNIT_OPTIONS: Record<ProductFamily, { value: TransactionUnit; label: string }[]> = {
  NORMAL: [
    { value: 'GROUP', label: 'Grupo (300 uds)' },
    { value: 'MAPLE', label: 'Maple (30 uds)' },
    { value: 'UNIT', label: 'Unidad' },
  ],
  WHITE: [
    { value: 'GROUP', label: 'Grupo (300 uds)' },
    { value: 'MAPLE', label: 'Maple (30 uds)' },
    { value: 'UNIT', label: 'Unidad' },
  ],
  PACKAGED: [{ value: 'PACK', label: 'Pack' }],
}

const METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
  CHECK: 'Cheque',
  OTHER: 'Otro',
}

function toBaseQty(qty: number, unit: TransactionUnit): number {
  if (unit === 'GROUP') return qty * 300
  if (unit === 'MAPLE') return qty * 30
  return qty
}

export default function CreateSalePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState<CreateSaleItemDto[]>([
    { productId: '', saleUnit: 'MAPLE', quantity: 1, unitPrice: '' },
  ])
  const [initialPayment, setInitialPayment] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  // Cargar clientes activos
  const { data: customers } = useQuery({
    queryKey: ['wholesale-customers-active'],
    queryFn: wholesaleSalesApi.getActiveCustomers,
  })

  // Cargar productos activos
  const { data: products } = useQuery<ProductOption[]>({
    queryKey: ['products-active'],
    queryFn: async () => {
      const res = await api.get('/products', { params: { isActive: true } })
      return res.data?.data ?? res.data
    },
  })

  const mutation = useMutation({
    mutationFn: (dto: CreateSaleDto) => wholesaleSalesApi.create(dto),
    onSuccess: (sale) => {
      queryClient.invalidateQueries({ queryKey: ['wholesale-sales'] })
      queryClient.invalidateQueries({ queryKey: ['wholesale-customers-active'] })
      navigate(`/wholesale-sales/${sale.id}`)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al crear la venta'))
    },
  })

  // Calcular total
  const total = items.reduce((acc, item) => {
    const base = toBaseQty(item.quantity, item.saleUnit)
    const price = parseFloat(item.unitPrice) || 0
    return acc + base * price
  }, 0)

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { productId: '', saleUnit: 'MAPLE', quantity: 1, unitPrice: '' },
    ])
  }

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleItemChange = (
    index: number,
    field: keyof CreateSaleItemDto,
    value: string | number,
  ) => {
    setItems((prev) => {
      const updated = [...prev]
      if (field === 'productId') {
        const product = products?.find((p) => p.id === value)
        const defaultUnit = product
          ? UNIT_OPTIONS[product.family][0].value
          : 'MAPLE'
        updated[index] = { ...updated[index], productId: value as string, saleUnit: defaultUnit }
      } else {
        updated[index] = { ...updated[index], [field]: value }
      }
      return updated
    })
  }

  const handleSubmit = () => {
    setError('')

    if (!customerId) { setError('Selecciona un cliente'); return }
    if (items.length === 0) { setError('Agrega al menos un producto'); return }

    for (const [i, item] of items.entries()) {
      if (!item.productId) { setError(`Selecciona el producto en la línea ${i + 1}`); return }
      if (!item.quantity || item.quantity <= 0) { setError(`Cantidad inválida en línea ${i + 1}`); return }
      if (!item.unitPrice || parseFloat(item.unitPrice) <= 0) { setError(`Precio inválido en línea ${i + 1}`); return }
    }

    const initPay = parseFloat(initialPayment) || 0
    if (initPay > total) { setError('El pago inicial no puede superar el total'); return }

    const dto: CreateSaleDto = {
      customerId,
      items: items.map((i) => ({
        ...i,
        quantity: Number(i.quantity),
        unitPrice: parseFloat(i.unitPrice).toFixed(2),
      })),
      ...(initPay > 0 && {
        initialPayment: initPay.toFixed(2),
        paymentMethod,
      }),
      ...(notes && { notes }),
    }

    mutation.mutate(dto)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-500 text-sm mb-4"
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <h1 className="text-xl font-bold text-gray-900">Nueva venta mayorista</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Cliente */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Cliente *
          </label>
          <div className="relative">
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="">Seleccionar cliente...</option>
              {customers?.map((c: ActiveCustomer) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} ({c.code})
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Package size={15} />
              Productos *
            </h2>
            <button
              onClick={handleAddItem}
              className="flex items-center gap-1 text-xs text-primary-600 font-medium"
            >
              <Plus size={14} /> Agregar
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {items.map((item, index) => {
              const product = products?.find((p) => p.id === item.productId)
              const unitOptions = product ? UNIT_OPTIONS[product.family] : UNIT_OPTIONS.NORMAL
              const baseQty = toBaseQty(item.quantity, item.saleUnit)
              const subtotal = baseQty * (parseFloat(item.unitPrice) || 0)

              return (
                <div key={index} className="border border-gray-100 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">
                      Línea {index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-400 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Producto */}
                  <div className="relative">
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    >
                      <option value="">Seleccionar producto...</option>
                      {products?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — Stock: {p.stock?.onHand ?? 0}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Unidad + Cantidad */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <select
                        value={item.saleUnit}
                        onChange={(e) =>
                          handleItemChange(index, 'saleUnit', e.target.value as TransactionUnit)
                        }
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                      >
                        {unitOptions.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)
                      }
                      placeholder="Cantidad"
                      className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Precio unitario */}
                  <div>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      placeholder="Precio por unidad base (Bs.)"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Subtotal */}
                  {item.productId && item.unitPrice && (
                    <div className="flex justify-between text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                      <span>{baseQty} uds base × Bs. {parseFloat(item.unitPrice).toFixed(2)}</span>
                      <span className="font-bold text-gray-800">Bs. {subtotal.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Total */}
        {total > 0 && (
          <div className="bg-primary-50 rounded-2xl border border-primary-100 px-4 py-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-primary-700">Total venta</span>
            <span className="text-xl font-bold text-primary-700">Bs. {total.toFixed(2)}</span>
          </div>
        )}

        {/* Pago inicial */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Pago inicial (opcional)
          </h2>
          <input
            type="number"
            inputMode="decimal"
            value={initialPayment}
            onChange={(e) => setInitialPayment(e.target.value)}
            placeholder="0.00"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
          />
          {parseFloat(initialPayment) > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {(['CASH', 'TRANSFER', 'CHECK', 'OTHER'] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    paymentMethod === m
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {METHOD_LABEL[m]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observaciones de la venta..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Botón confirmar */}
      <div className="bg-white border-t border-gray-100 px-4 py-4">
        <button
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="w-full bg-primary-600 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 text-base"
        >
          {mutation.isPending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            `Confirmar venta${total > 0 ? ` · Bs. ${total.toFixed(2)}` : ''}`
          )}
        </button>
      </div>
    </div>
  )
}