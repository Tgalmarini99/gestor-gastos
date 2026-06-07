import { useState } from 'react'
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react'
import { formatMonthLabel } from '../../utils/formatters'

const MONTH_ABBR = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
function shortMonth(m) { return MONTH_ABBR[parseInt(m.split('-')[1], 10) - 1] }

function DetailView({ detail }) {
  if (!detail) return null

  if (detail.type === 'block') {
    return (
      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Datos del período</p>
        {detail.months.map(m => (
          <div key={m.month} className="flex justify-between text-xs">
            <span className="text-slate-500">{shortMonth(m.month)}</span>
            <span className="font-semibold text-slate-700">{m.pct.toFixed(0)}%</span>
          </div>
        ))}
        <div className="flex justify-between text-xs pt-1 border-t border-slate-100">
          <span className="text-slate-500">Promedio</span>
          <span className="font-bold text-slate-800">{detail.avg.toFixed(0)}%</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Plan</span>
          <span className="font-semibold text-slate-600">{detail.plan}%</span>
        </div>
      </div>
    )
  }

  if (detail.type === 'goal') {
    return (
      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Proyección actual</p>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Aporte promedio</span>
          <span className="font-semibold text-slate-700">
            {detail.monthlyAvg > 0
              ? `${detail.currency} ${Math.round(detail.monthlyAvg).toLocaleString('es-AR')}/mes`
              : 'Sin aportes'}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Meses proyectados</span>
          <span className="font-bold text-red-600">{detail.projectedMonths ?? '∞'}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Tiempo disponible</span>
          <span className="font-semibold text-slate-700">{detail.deadlineMonths}</span>
        </div>
      </div>
    )
  }

  if (detail.type === 'category') {
    return (
      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Gastos vs presupuesto</p>
        {detail.months.map(m => (
          <div key={m.month} className="flex justify-between text-xs">
            <span className="text-slate-500">{shortMonth(m.month)}</span>
            <span className="font-semibold text-red-600">
              $ {Math.round(m.spent).toLocaleString('es-AR')}
            </span>
          </div>
        ))}
        <div className="flex justify-between text-xs pt-1 border-t border-slate-100">
          <span className="text-slate-500">Presupuesto actual</span>
          <span className="font-semibold text-slate-600">$ {Math.round(detail.budget).toLocaleString('es-AR')}</span>
        </div>
      </div>
    )
  }

  return null
}

export default function SuggestionCard({ suggestion, onAccept, onDismiss }) {
  const [showDetail, setShowDetail] = useState(false)
  const hasChanges = suggestion.changes.length > 0

  return (
    <div className="bg-white border border-amber-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-amber-600 text-sm">💡</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 mb-1">{suggestion.title}</p>
          <p className="text-xs text-slate-500 leading-relaxed">{suggestion.message}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {hasChanges && (
          <button
            onClick={() => onAccept(suggestion)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl active:bg-emerald-700 transition-colors"
          >
            <Check size={13} strokeWidth={2.5} />
            Aceptar
          </button>
        )}
        {!hasChanges && (
          <button
            onClick={() => onAccept(suggestion)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl active:bg-slate-200 transition-colors"
          >
            <Check size={13} strokeWidth={2.5} />
            Entendido
          </button>
        )}
        <button
          onClick={() => setShowDetail(v => !v)}
          className="px-3 py-2 bg-slate-50 text-slate-500 text-xs font-semibold rounded-xl active:bg-slate-100 flex items-center gap-1"
        >
          {showDetail ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          Detalle
        </button>
        <button
          onClick={() => onDismiss(suggestion.ruleId)}
          className="w-9 flex items-center justify-center bg-slate-50 rounded-xl active:bg-slate-100"
          aria-label="Descartar"
        >
          <X size={14} className="text-slate-400" />
        </button>
      </div>

      {showDetail && <DetailView detail={suggestion.detail} />}
    </div>
  )
}
