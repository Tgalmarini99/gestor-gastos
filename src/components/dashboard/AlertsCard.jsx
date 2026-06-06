import { AlertTriangle, XCircle } from 'lucide-react'
import Card from '../ui/Card'
import { getCategoryInfo } from '../../data/categories'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { toBaseCurrency } from '../../utils/calculations'

export default function AlertsCard({ categoryTotals, budgets, config }) {
  const alerts = budgets
    .map(b => {
      const spent = categoryTotals[b.category] ?? 0
      const limit = toBaseCurrency(b.monthlyLimit, b.currency, config)
      const pct = limit > 0 ? (spent / limit) * 100 : 0
      return { ...b, spent, limit, pct }
    })
    .filter(a => a.pct >= 80)
    .sort((a, b) => b.pct - a.pct)

  if (alerts.length === 0) return null

  return (
    <section className="px-4">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Alertas ({alerts.length})
      </h2>
      <Card className="divide-y divide-slate-50">
        {alerts.map(alert => {
          const cat = getCategoryInfo(alert.category)
          const isOver = alert.pct >= 100
          return (
            <div key={alert.category} className="flex items-center gap-3 px-4 py-3.5">
              <span className={`flex-shrink-0 ${isOver ? 'text-red-500' : 'text-amber-500'}`}>
                {isOver ? <XCircle size={18} /> : <AlertTriangle size={18} />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">
                  {cat.icon} {cat.label}
                </p>
                <p className="text-xs text-slate-400">
                  {formatCurrency(alert.spent, config.baseCurrency)} de {formatCurrency(alert.limit, config.baseCurrency)}
                </p>
              </div>
              <span className={`text-xs font-bold flex-shrink-0 ${isOver ? 'text-red-600' : 'text-amber-600'}`}>
                {formatPercent(alert.pct)}
              </span>
            </div>
          )
        })}
      </Card>
    </section>
  )
}
