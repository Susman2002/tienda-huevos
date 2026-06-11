interface Props {
  onHand: number
  threshold: number
}

const CRITICAL = 0.3  // < 30% del umbral → rojo
const WARNING  = 1.0  // < 100% del umbral → amarillo

export default function StockAlertBadge({ onHand, threshold }: Props) {
  const ratio = onHand / threshold

  if (ratio <= CRITICAL) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Crítico
      </span>
    )
  }

  if (ratio < WARNING) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">
        <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
        Bajo
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      OK
    </span>
  )
}