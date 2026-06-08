import { Plus } from 'lucide-react'
import { formatCurrency, formatMonthLabel } from '../../utils/formatters'

export default function BalanceCard({
  arsBalance,
  usdBalance,
  arsInGoals,
  usdInGoals,
  monthly,
  currentMonth,
  onAddARS,
  onAddUSD,
}) {
  const { arsIn = 0, usdIn = 0, arsOut = 0, usdOut = 0, arsContrib = 0, usdContrib = 0 } = monthly ?? {}

  const hasGoals = (arsInGoals ?? 0) > 0 || (usdInGoals ?? 0) > 0
  const hasMonthContrib = arsContrib > 0 || usdContrib > 0

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-blue-500 text-white px-5 pt-14 pb-8">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
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

      {/* Balances disponibles */}
      <div className="space-y-0.5 mb-4">
        <p className={`text-4xl font-bold tracking-tight ${arsBalance < 0 ? 'text-red-300' : 'text-white'}`}>
          {arsBalance < 0 ? '−' : ''}{formatCurrency(Math.abs(arsBalance), 'ARS')}
        </p>
        <p className={`text-2xl font-semibold ${usdBalance < 0 ? 'text-red-300' : 'text-white/80'}`}>
          {usdBalance < 0 ? '−' : ''}{formatCurrency(Math.abs(usdBalance), 'USD')}
        </p>
      </div>

      {/* En objetivos */}
      {hasGoals && (
        <div className="flex items-center gap-2 mb-4 bg-white/10 rounded-xl px-3 py-2">
          <span className="text-white/50 text-xs">🎯 En objetivos</span>
          <div className="flex gap-3 ml-auto">
            {(arsInGoals ?? 0) > 0 && (
              <span className="text-white/80 text-xs font-semibold">
                {formatCurrency(Math.round(arsInGoals), 'ARS')}
              </span>
            )}
            {(usdInGoals ?? 0) > 0 && (
              <span className="text-white/80 text-xs font-semibold">
                {formatCurrency(Math.round(usdInGoals), 'USD')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Month breakdown */}
      <div
        className={`grid gap-4 pt-4 border-t border-white/20 text-sm ${
          hasMonthContrib ? 'grid-cols-3' : 'grid-cols-2'
        }`}
      >
        <div>
          <p className="text-white/60 text-xs mb-1">↓ Ingresado</p>
          <p className="font-semibold text-emerald-300">{formatCurrency(arsIn, 'ARS')}</p>
          {usdIn > 0 && <p className="text-emerald-300/80 text-xs mt-0.5">{formatCurrency(usdIn, 'USD')}</p>}
        </div>
        <div>
          <p className="text-white/60 text-xs mb-1">↑ Gastado</p>
          <p className="font-semibold text-red-300">{formatCurrency(arsOut, 'ARS')}</p>
          {usdOut > 0 && <p className="text-red-300/80 text-xs mt-0.5">{formatCurrency(usdOut, 'USD')}</p>}
        </div>
        {hasMonthContrib && (
          <div>
            <p className="text-white/60 text-xs mb-1">🎯 Objetivos</p>
            {arsContrib > 0 && <p className="font-semibold text-indigo-200">{formatCurrency(Math.round(arsContrib), 'ARS')}</p>}
            {usdContrib > 0 && <p className="text-indigo-200/80 text-xs mt-0.5">{formatCurrency(Math.round(usdContrib), 'USD')}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
