import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const modules = [
  {
    to: '/suppliers',
    icon: '🚚',
    label: 'Proveedores',
    description: 'Gestiona proveedores y pedidos semanales',
    available: true,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    iconBg: 'bg-blue-100',
  },
  {
    to: '/customers',
    icon: '👥',
    label: 'Clientes',
    description: 'Clientes mayoristas y deudas',
    available: true,
    color: 'bg-gray-50 border-gray-200 text-gray-400',
    iconBg: 'bg-gray-100',
  },
  {
    to: null,
    icon: '🛒',
    label: 'Ventas',
    description: 'Ventas al por menor y mayor',
    available: false,
    color: 'bg-gray-50 border-gray-200 text-gray-400',
    iconBg: 'bg-gray-100',
  },
  {
    to: '/stock',
    icon: '📦',
    label: 'Stock',
    description: 'Inventario y alertas de stock',
    available: true,
    color: 'bg-gray-50 border-gray-200 text-gray-400',
    iconBg: 'bg-gray-100',
  },
  {
    to: null,
    icon: '📊',
    label: 'Reportes',
    description: 'Ganancias y resúmenes diarios',
    available: false,
    color: 'bg-gray-50 border-gray-200 text-gray-400',
    iconBg: 'bg-gray-100',
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="p-4 max-w-2xl mx-auto">

      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-5
        text-white mb-6 shadow-md">
        <p className="text-primary-100 text-sm mb-1">Bienvenido de vuelta 👋</p>
        <h1 className="text-xl font-bold">{user?.name}</h1>
        <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
          {user?.role}
        </span>
      </div>

      {/* Módulos */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Módulos</h2>
      <div className="grid grid-cols-1 gap-3">
        {modules.map((mod) => (
          <div
            key={mod.label}
            onClick={() => mod.available && mod.to && navigate(mod.to)}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition
              ${mod.available
                ? 'cursor-pointer hover:shadow-md active:scale-[0.98]'
                : 'cursor-not-allowed opacity-60'}
              ${mod.color}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center
              text-2xl flex-shrink-0 ${mod.iconBg}`}>
              {mod.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{mod.label}</p>
              <p className="text-xs opacity-70 mt-0.5">{mod.description}</p>
            </div>
            {mod.available ? (
              <span className="text-lg opacity-60">›</span>
            ) : (
              <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full
                flex-shrink-0">
                Pronto
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}