import Card from '../ui/Card'
import ProgressBar from '../ui/ProgressBar'
import { formatCurrency, formatPercent } from '../../utils/formatters'

const BLOCKS = [
  {
    key: 'needs',
    label: 'Necesidades',
    share: 50,
    emoji: '🏠',
    bar: 'bg-blue-500',
    badgeNormal: 'bg-blue-50 text-blue-700',
    badgeWarn: 'bg-amber-50 text-amber-700',
    badgeOver: 'bg-red-50 text-red-700',
  },
  {
    key: 'wants',
    label: 'Deseos',
    share: 30,
    emoji: '✨',
    bar: 'bg-violet-500',
    badgeNormal: 'bg-violet-50 text-violet-700',
    badgeWarn: 'bg-amber-50 text-amber-700',
    badgeOver: 'bg-red-50 text-red-700',
  },
  {
    key: 'savings',
    label: 'Ahorro',
    share: 20,
    emoji: '🎯',
    bar: 'bg-emerald-500',
    badgeNormal: 'bg-emerald-50 text-emerald-700',
    badgeWarn: 'bg-amber-50 text-amber-700',
    badgeOver: 'bg-red-50 text-red-700',
  },
]

function BlockCard({ block, budget, spent, baseCurrency }) {
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0
  const isWarn = pct >= 80 && pct < 100
  const isOver = pct >= 100

  const badgeClass = isOver
    ? block.badgeOver
    : isWarn
    ? block.badgeWarn
    : block.badgeNormal

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{block.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-slate-800">{block.label}</p>
            <p className="text-xs text-slate-400">{block.share}% del ingreso</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeClass}`}>
          {formatPercent(pct)}
        </span>
      </div>

      <ProgressBar value={spent} max={budget} colorClass={block.bar} className="mb-2" />

      <div className="flex justify-between text-xs text-slate-400">
        <span>{formatCurrency(spent, baseCurrency)} gastado</span>
        <span>de {formatCurrency(budget, baseCurrency)}</span>
      </div>
    </Card>
  )
}

export default function BlockSummary({ blockBudgets, blockTotals, baseCurrency }) {
  return (
    <section className="px-4">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Regla 50 / 30 / 20
      </h2>
      <div className="space-y-3">
        {BLOCKS.map(block => (
          <BlockCard
            key={block.key}
            block={block}
            budget={blockBudgets[block.key] ?? 0}
            spent={blockTotals[block.key] ?? 0}
            baseCurrency={baseCurrency}
          />
        ))}
      </div>
    </section>
  )
}
