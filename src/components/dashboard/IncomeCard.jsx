import { TrendingUp } from 'lucide-react'
import { formatCurrency, formatMonthLabel } from '../../utils/formatters'
import { getTotalIncome } from '../../utils/calculations'

export default function IncomeCard({ income, config, currentMonth }) {
  const total = getTotalIncome(income, config)

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-blue-500 text-white px-5 pt-14 pb-8">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
            {formatMonthLabel(currentMonth)}
          </p>
          <p className="text-white/80 text-sm mt-0.5">Ingreso total</p>
        </div>
        <div className="bg-white/20 rounded-xl p-2">
          <TrendingUp size={20} />
        </div>
      </div>

      <p className="text-4xl font-bold tracking-tight">
        {formatCurrency(total, config.baseCurrency)}
      </p>

      <div className="flex gap-5 mt-5 pt-4 border-t border-white/20 text-sm">
        <div>
          <p className="text-white/60 text-xs mb-0.5">Pesos</p>
          <p className="font-semibold">{formatCurrency(income?.amountARS ?? 0, 'ARS')}</p>
        </div>
        <div className="w-px bg-white/20" />
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
    </div>
  )
}
