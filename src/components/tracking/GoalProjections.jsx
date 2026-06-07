import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { formatCurrency, formatMonthLabel } from '../../utils/formatters'
import ProgressBar from '../ui/ProgressBar'

export default function GoalProjections({ projections }) {
  if (!projections.length) return (
    <p className="text-sm text-slate-400 text-center py-4">Sin objetivos activos</p>
  )

  return (
    <div className="space-y-3">
      {projections.map(p => {
        const pct = p.targetAmount > 0 ? Math.min(100, (p.accumulated / p.targetAmount) * 100) : 0
        const noContribs = p.monthlyAvg === 0

        return (
          <div
            key={p.id}
            className={`rounded-2xl p-4 border ${p.isAtRisk ? 'border-red-100 bg-red-50' : 'border-slate-100 bg-white'}`}
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-bold text-slate-800 truncate pr-2">{p.name}</p>
              {p.deadline
                ? p.isAtRisk
                  ? <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                  : <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                : <Clock size={15} className="text-slate-300 flex-shrink-0 mt-0.5" />
              }
            </div>

            <ProgressBar
              value={p.accumulated}
              max={p.targetAmount}
              colorClass={p.isAtRisk ? 'bg-red-400' : 'bg-indigo-500'}
              className="mb-3"
            />

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-400 mb-0.5">Aporte prom. (3M)</p>
                <p className="font-semibold text-slate-700">
                  {noContribs
                    ? 'Sin aportes'
                    : formatCurrency(Math.round(p.monthlyAvg), p.currency) + '/mes'
                  }
                </p>
              </div>
              <div>
                <p className="text-slate-400 mb-0.5">Proyección</p>
                <p className={`font-bold ${p.isAtRisk ? 'text-red-600' : 'text-slate-700'}`}>
                  {noContribs
                    ? '—'
                    : p.projectedMonths != null
                    ? `${p.projectedMonths} mes${p.projectedMonths !== 1 ? 'es' : ''}`
                    : '—'
                  }
                </p>
              </div>
              {p.deadline && (
                <>
                  <div>
                    <p className="text-slate-400 mb-0.5">Fecha límite</p>
                    <p className="font-semibold text-slate-700">
                      {formatMonthLabel(p.deadline.slice(0, 7))}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-0.5">Tiempo disponible</p>
                    <p className={`font-semibold ${p.isAtRisk ? 'text-red-600' : 'text-slate-700'}`}>
                      {p.deadlineMonths} mes{p.deadlineMonths !== 1 ? 'es' : ''}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
