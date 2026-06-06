export default function ProgressBar({ value, max, colorClass = 'bg-blue-500', className = '' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0

  const autoColor = () => {
    if (pct >= 100) return 'bg-red-500'
    if (pct >= 80) return 'bg-amber-500'
    return colorClass
  }

  return (
    <div className={`w-full bg-slate-100 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${autoColor()}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
