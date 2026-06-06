import Card from '../ui/Card'
import ProgressBar from '../ui/ProgressBar'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { getGoalProgress, getMonthsUntilDeadline } from '../../utils/calculations'

export default function GoalsCard({ goals }) {
  const active = goals.filter(g => getGoalProgress(g).percentage < 100)
  if (active.length === 0) return null

  return (
    <section className="px-4">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Objetivos de ahorro
      </h2>
      <Card className="divide-y divide-slate-50">
        {active.map(goal => {
          const { accumulated, percentage } = getGoalProgress(goal)
          const months = getMonthsUntilDeadline(goal.deadline)
          return (
            <div key={goal.id} className="px-4 py-3.5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-800 truncate pr-2">{goal.name}</p>
                <span className="text-xs font-bold text-emerald-600 flex-shrink-0">
                  {formatPercent(percentage)}
                </span>
              </div>
              <ProgressBar
                value={accumulated}
                max={goal.targetAmount}
                colorClass="bg-emerald-500"
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>
                  {formatCurrency(accumulated, goal.currency)} de {formatCurrency(goal.targetAmount, goal.currency)}
                </span>
                <span>{months > 0 ? `${months} mes${months !== 1 ? 'es' : ''}` : 'Vencido'}</span>
              </div>
            </div>
          )
        })}
      </Card>
    </section>
  )
}
