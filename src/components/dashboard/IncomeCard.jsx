import { Pencil } from 'lucide-react'
import { formatCurrency, formatMonthLabel } from '../../utils/formatters'
import { getTotalIncome } from '../../utils/calculations'

export default function IncomeCard({ income, config, currentMonth, onEdit }) {
  const total = getTotalIncome(income, config)
  const hasIncome = total > 0

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-blue-500 text-white px-5 pt-14 pb-8">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
            {formatMonthLabel(currentMonth)}
          </p>
          <p className="text-white/80 text-sm mt-0.5">Ingreso total</p>
        </div>
        <button
          onClick={onEdit}
          className="bg-white/20 hover:bg-white/30 active:bg-white/10 rounded-xl p-2 transition-colors"
          aria-label="Editar ingresos"
        >
          <Pencil size={18} />
        </button>
      </div>

      {hasIncome ? (
        <>
          <p className="text-4xl font-bold tracking-tight">
            {formatCurrency(total, config.baseCurrency)}
          </p>

          <div className="flex gap-5 mt-5 pt-4 border-t border-white/20 text-sm">
            {(income?.amountARS ?? 0) > 0 && (
              <>
                <div>
                  <p className="text-white/60 text-xs mb-0.5">Pesos</p>
                  <p className="font-semibold">{formatCurrency(income.amountARS, 'ARS')}</p>
                </div>
                <div className="w-px bg-white/20" />
              </>
            )}
            <div>
              <p className="text-white/60 text-xs mb-0.5">Dólares</p>
              <p className="font-semibold">{formatCurrency(income?.amountUSD ?? 0, 'USD')}</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-white/60 text-xs mb-0.5">TC</p>
              <p className="font-semibold">
                $ {config.exchangeRate.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </>
      ) : (
        <button
          onClick={onEdit}
          className="mt-2 flex items-center gap-2 bg-white/15 hover:bg-white/25 active:bg-white/10 rounded-2xl px-4 py-3 transition-colors w-full"
        >
          <Pencil size={16} className="text-white/70" />
          <span className="text-white/80 text-sm font-medium">
            Ingresá tu sueldo de {formatMonthLabel(currentMonth)}
          </span>
        </button>
      )}
    </div>
  )
}
