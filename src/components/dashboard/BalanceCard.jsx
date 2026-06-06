import { Plus } from 'lucide-react'
import { formatCurrency, formatMonthLabel } from '../../utils/formatters'

export default function BalanceCard({
  arsBalance,
  usdBalance,
  monthly,
  currentMonth,
  onAddARS,
  onAddUSD,
}) {
  const { arsIn = 0, usdIn = 0, arsOut = 0, usdOut = 0 } = monthly ?? {}

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
        <div className="flex gap-2">
          <button
            onClick={onAddARS}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 active:bg-white/10 rounded-xl px-3 py-2 transition-colors"
            aria-label="Agregar pesos"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span className="text-xs font-bold">$ ARS</span>
          </button>
          <button
            onClick={onAddUSD}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 active:bg-white/10 rounded-xl px-3 py-2 transition-colors"
            aria-label="Agregar dólares"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span className="text-xs font-bold">USD</span>
          </button>
        </div>
      </div>

      {/* Balances */}
      <div className="space-y-1">
        <p className={`text-4xl font-bold tracking-tight ${arsBalance < 0 ? 'text-red-300' : 'text-white'}`}>
          {arsBalance < 0 ? '−' : ''}{formatCurrency(Math.abs(arsBalance), 'ARS')}
        </p>
        <p className={`text-2xl font-semibold ${usdBalance < 0 ? 'text-red-300' : 'text-white/80'}`}>
          {usdBalance < 0 ? '−' : ''}{formatCurrency(Math.abs(usdBalance), 'USD')}
        </p>
      </div>

      {/* Month breakdown */}
      <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/20 text-sm">
        <div>
          <p className="text-white/60 text-xs mb-1">↓ Ingresado este mes</p>
          <p className="font-semibold text-emerald-300">{formatCurrency(arsIn, 'ARS')}</p>
          <p className="text-emerald-300/80 text-xs mt-0.5">{formatCurrency(usdIn, 'USD')}</p>
        </div>
        <div>
          <p className="text-white/60 text-xs mb-1">↑ Gastado este mes</p>
          <p className="font-semibold text-red-300">{formatCurrency(arsOut, 'ARS')}</p>
          <p className="text-red-300/80 text-xs mt-0.5">{formatCurrency(usdOut, 'USD')}</p>
        </div>
      </div>
    </div>
  )
}
