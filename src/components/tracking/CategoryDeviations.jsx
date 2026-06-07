import { formatCurrency } from '../../utils/formatters'

function Row({ item, sign }) {
  const isOver = sign === 'over'
  return (
    <div className="flex items-center gap-2 py-2.5">
      <span className="text-lg">{item.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700 truncate">{item.label}</p>
        <p className="text-xs text-slate-400">
          promedio {formatCurrency(Math.round(item.avgAmount), 'ARS')}
          {' · '}presupuesto {formatCurrency(Math.round(item.budgetARS), 'ARS')}
        </p>
      </div>
      <span className={`text-sm font-bold flex-shrink-0 ${isOver ? 'text-red-500' : 'text-emerald-600'}`}>
        {isOver ? '+' : ''}{formatCurrency(Math.round(item.deviation), 'ARS')}
      </span>
    </div>
  )
}

export default function CategoryDeviations({ data }) {
  const hasOver  = data.over.length  > 0
  const hasUnder = data.under.length > 0
  if (!hasOver && !hasUnder) return (
    <p className="text-sm text-slate-400 text-center py-4">
      Sin presupuestos configurados para el período
    </p>
  )

  return (
    <div className="space-y-4">
      {hasOver && (
        <div>
          <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-1">
            Más gastadas
          </p>
          <div className="divide-y divide-slate-100">
            {data.over.map(item => <Row key={item.category} item={item} sign="over" />)}
          </div>
        </div>
      )}
      {hasUnder && (
        <div>
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-wide mb-1">
            Más ahorradas
          </p>
          <div className="divide-y divide-slate-100">
            {data.under.map(item => <Row key={item.category} item={item} sign="under" />)}
          </div>
        </div>
      )}
    </div>
  )
}
