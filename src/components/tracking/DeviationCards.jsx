function DevCard({ label, avg, plan, dev, positiveIsGood }) {
  const isPositive = dev > 0
  const isGood = positiveIsGood ? isPositive : !isPositive
  const colorClass = Math.abs(dev) < 2
    ? 'text-slate-500'
    : isGood
    ? 'text-emerald-600'
    : 'text-red-500'
  const bgClass = Math.abs(dev) < 2
    ? 'bg-slate-50'
    : isGood
    ? 'bg-emerald-50'
    : 'bg-red-50'

  return (
    <div className={`rounded-2xl p-3 ${bgClass}`}>
      <p className="text-xs font-semibold text-slate-500 mb-2">{label}</p>
      <p className="text-lg font-bold text-slate-800">{avg.toFixed(0)}%</p>
      <p className="text-[10px] text-slate-400 mb-1">plan: {plan}%</p>
      <p className={`text-sm font-bold ${colorClass}`}>
        {dev > 0 ? '+' : ''}{dev.toFixed(0)}%
      </p>
    </div>
  )
}

export default function DeviationCards({ avgs }) {
  if (!avgs) return null

  return (
    <div className="grid grid-cols-3 gap-2">
      <DevCard
        label="Necesidades"
        avg={avgs.needsAvg}
        plan={avgs.needsPlan}
        dev={avgs.needsDev}
        positiveIsGood={false}
      />
      <DevCard
        label="Deseos"
        avg={avgs.wantsAvg}
        plan={avgs.wantsPlan}
        dev={avgs.wantsDev}
        positiveIsGood={false}
      />
      <DevCard
        label="Ahorro"
        avg={avgs.savingsAvg}
        plan={avgs.savingsPlan}
        dev={avgs.savingsDev}
        positiveIsGood={true}
      />
    </div>
  )
}
