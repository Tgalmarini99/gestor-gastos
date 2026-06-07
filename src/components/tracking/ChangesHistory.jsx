import { useState } from 'react'
import { History, ChevronDown, ChevronUp } from 'lucide-react'
import { formatShortDate } from '../../utils/formatters'

const FIELD_LABELS = {
  needsPercent:   'Necesidades %',
  wantsPercent:   'Deseos %',
  savingsPercent: 'Ahorro %',
  monthlyLimit:   'Presupuesto',
  priority:       'Prioridad',
}

function ChangeRow({ entry }) {
  return (
    <div className="py-3 border-b border-slate-50 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-700">{entry.description}</p>
        <span className="text-xs text-slate-400 flex-shrink-0">{formatShortDate(entry.date)}</span>
      </div>
      {entry.changes.filter(ch => ch.oldValue !== undefined).map((ch, i) => (
        <p key={i} className="text-xs text-slate-400 mt-0.5">
          {FIELD_LABELS[ch.field] ?? ch.field}:{' '}
          <span className="line-through">{String(ch.oldValue)}</span>
          {' → '}
          <span className="font-semibold text-slate-600">{String(ch.newValue)}</span>
        </p>
      ))}
    </div>
  )
}

export default function ChangesHistory({ history }) {
  const [open, setOpen] = useState(false)
  if (!history.length) return null

  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-2">
          <History size={15} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">
            Historial de cambios
          </span>
          <span className="text-xs bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded-full">
            {history.length}
          </span>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4">
          {history.map(entry => <ChangeRow key={entry.id} entry={entry} />)}
        </div>
      )}
    </div>
  )
}
