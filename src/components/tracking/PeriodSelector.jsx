const OPTIONS = [
  { value: 3,  label: '3M' },
  { value: 6,  label: '6M' },
  { value: 12, label: '12M' },
]

export default function PeriodSelector({ value, onChange }) {
  return (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${
            value === opt.value
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-400'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
