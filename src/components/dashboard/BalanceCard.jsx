import { Plus } from 'lucide-react'
import { formatCurrency, formatMonthLabel } from '../../utils/formatters'

export default function BalanceCard({
  balance,
  monthIn,
  monthOut,
  currentMonth,
  baseCurrency,
  onAddDeposit,
}) {
  const isNegative = balance < 0

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-blue-500 text-white px-5 pt-14 pb-8">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
            {formatMonthLabel(currentMonth)}
          </p>
          <p className="text-white/80 text-sm mt-0.5">Balance disponible</p>
        </div>
        <button
          onClick={onAddDeposit}
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:bg-white/10 rounded-xl px-3 py-2 transition-colors"
          aria-label="Agregar dinero"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className="text-sm font-semibold">Agregar</span>
        </button>
      </div>

      {/* Balance */}
      <p className={`text-4xl font-bold tracking-tight ${isNegative ? 'text-red-300' : 'text-white'}`}>
        {formatCurrency(Math.abs(balance), baseCurrency)}
        {isNegative && <span className="text-2xl ml-1 text-red-300"> (negativo)</span>}
      </p>

      {/* Month breakdown */}
      <div className="flex gap-5 mt-5 pt-4 border-t border-white/20 text-sm">
        <div>
          <p className="text-white/60 text-xs mb-0.5">↓ Ingresado</p>
          <p className="font-semibold text-emerald-300">
            {formatCurrency(monthIn, baseCurrency)}
          </p>
        </div>
        <div className="w-px bg-white/20" />
        <div>
          <p className="text-white/60 text-xs mb-0.5">↑ Gastado</p>
          <p className="font-semibold text-red-300">
            {formatCurrency(monthOut, baseCurrency)}
          </p>
        </div>
        <div className="w-px bg-white/20" />
        <div>
          <p className="text-white/60 text-xs mb-0.5">Este mes</p>
          <p className={`font-semibold ${monthIn - monthOut >= 0 ? 'text-white' : 'text-red-300'}`}>
            {monthIn - monthOut >= 0 ? '+' : ''}{formatCurrency(monthIn - monthOut, baseCurrency)}
          </p>
        </div>
      </div>
    </div>
  )
}
