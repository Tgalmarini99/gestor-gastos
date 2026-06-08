import { useState } from 'react'
import { X, Pencil, Trash2, Plus, Clock, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'
import ProgressBar from '../ui/ProgressBar'
import { formatCurrency, formatMonthLabel, formatShortDate } from '../../utils/formatters'

const todayStr = () => new Date().toISOString().split('T')[0]

function convertAmount(amount, fromCurrency, toCurrency, bnaRate) {
  if (fromCurrency === toCurrency) return amount
  return fromCurrency === 'USD' ? amount * bnaRate : amount / bnaRate
}

const PRIORITY_LABEL = { alta: 'Alta', media: 'Media', baja: 'Baja' }
const PRIORITY_COLOR = {
  alta:  'bg-rose-100 text-rose-700',
  media: 'bg-amber-100 text-amber-700',
  baja:  'bg-sky-100 text-sky-700',
}
const STATUS_COLOR = {
  activo:     'bg-emerald-100 text-emerald-700',
  pausado:    'bg-amber-100 text-amber-700',
  completado: 'bg-slate-100 text-slate-600',
}
const STATUS_LABEL = { activo: 'Activo', pausado: 'Pausado', completado: 'Completado' }

function ContribForm({ goal, config, onSave, onCancel }) {
  const [form, setForm] = useState({
    amount: '',
    currency: goal.currency,
    date: todayStr(),
    type: 'mensual',
    note: '',
  })
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const rawAmount = Number(form.amount) || 0
  const bnaRate   = config?.bnaRate ?? 1200
  const isValid   = rawAmount > 0

  // Monto convertido a la moneda del objetivo (para preview)
  const convertedAmount = convertAmount(rawAmount, form.currency, goal.currency, bnaRate)
  const showConversion  = form.currency !== goal.currency && rawAmount > 0

  const handleSave = () => {
    if (!isValid) return
    onSave({
      ...form,
      amount:   convertedAmount,
      currency: goal.currency,
    })
  }

  return (
    <div className="border-t border-slate-100 pt-4 mt-4 space-y-3">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Nuevo aporte</p>

      {/* Tipo */}
      <div className="flex gap-2">
        {['mensual', 'extraordinario'].map(t => (
          <button
            key={t}
            onClick={() => set('type', t)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
              form.type === t
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {t === 'mensual' ? 'Mensual' : 'Extraordinario'}
          </button>
        ))}
      </div>

      {/* Moneda + Monto */}
      <div className="flex gap-2">
        <div className="flex gap-1 flex-shrink-0">
          {['ARS', 'USD'].map(c => (
            <button
              key={c}
              onClick={() => set('currency', c)}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                form.currency === c
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={form.amount}
          onChange={e => set('amount', e.target.value)}
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          autoFocus
        />
      </div>

      {/* Preview de conversión */}
      {showConversion && (
        <p className="text-xs text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">
          Se registrará como{' '}
          <strong>{formatCurrency(Math.round(convertedAmount), goal.currency)}</strong>
          {' '}(TC $ {bnaRate.toLocaleString('es-AR')})
        </p>
      )}

      {/* Fecha */}
      <input
        type="date"
        value={form.date}
        onChange={e => set('date', e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      {/* Nota */}
      <input
        type="text"
        placeholder="Nota (opcional) — ej: aguinaldo"
        value={form.note}
        onChange={e => set('note', e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-600"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={!isValid}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            isValid ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-300'
          }`}
        >
          Guardar
        </button>
      </div>
    </div>
  )
}

export default function GoalDetail({
  goal,
  suggestion,
  config,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onAddContribution,
}) {
  const [addingContrib, setAddingContrib] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!goal) return null

  const { accumulated, percentage, remaining, suggestedMonthly, monthsToComplete, deadlineMonths, isOnTrack, extraNeededMonthly } = suggestion ?? {}
  const isCompleted = goal.status === 'completado' || percentage >= 100
  const sortedContribs = [...(goal.contributions ?? [])].sort((a, b) => b.date.localeCompare(a.date))

  const handleSaveContrib = (contrib) => {
    onAddContribution(goal.id, contrib)
    setAddingContrib(false)
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-3xl z-[60] flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '92dvh' }}
      >
        <div className="flex justify-center pt-2.5 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 flex-shrink-0">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
          <div className="flex items-center gap-1.5 min-w-0">
            <h2 className="text-base font-bold text-slate-800 truncate max-w-[160px]">
              {goal.name}
            </h2>
            {goal.currency === 'USD' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 bg-emerald-100 text-emerald-700">
                USD
              </span>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-400"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5">

          {/* Delete confirm */}
          {confirmDelete && (
            <div className="mb-4 p-4 bg-red-50 rounded-xl">
              <p className="text-sm font-semibold text-red-700 mb-3">¿Eliminar este objetivo y todos sus aportes?</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-white border border-slate-200 text-slate-600">Cancelar</button>
                <button onClick={onDelete} className="flex-1 py-2 rounded-lg text-sm font-bold bg-red-500 text-white">Eliminar</button>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="flex gap-2 mb-4">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PRIORITY_COLOR[goal.priority] ?? 'bg-slate-100 text-slate-600'}`}>
              {PRIORITY_LABEL[goal.priority] ?? goal.priority}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[goal.status] ?? 'bg-slate-100 text-slate-600'}`}>
              {STATUS_LABEL[goal.status] ?? goal.status}
            </span>
          </div>

          {/* Progreso */}
          <div className="mb-5">
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {formatCurrency(accumulated ?? 0, goal.currency)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  de {formatCurrency(goal.targetAmount, goal.currency)}
                </p>
              </div>
              <p className={`text-2xl font-bold ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                {Math.round(percentage ?? 0)}%
              </p>
            </div>
            <ProgressBar
              value={accumulated ?? 0}
              max={goal.targetAmount}
              colorClass={isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}
              className="h-3"
            />
          </div>

          {/* Estadísticas */}
          {!isCompleted && suggestion && (
            <div className="bg-slate-50 rounded-2xl p-4 mb-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Aporte mensual sugerido</span>
                <span className="font-bold text-slate-800">
                  {formatCurrency(Math.round(suggestedMonthly ?? 0), goal.currency)}
                </span>
              </div>

              {goal.deadline && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Fecha límite</span>
                  <span className="font-semibold text-slate-700">
                    {formatMonthLabel(goal.deadline.slice(0, 7))}
                    {deadlineMonths !== null && (
                      <span className="text-slate-400 font-normal ml-1">
                        ({deadlineMonths} mes{deadlineMonths !== 1 ? 'es' : ''})
                      </span>
                    )}
                  </span>
                </div>
              )}

              {monthsToComplete !== null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">A este ritmo</span>
                  <span className="font-semibold text-slate-700">
                    {monthsToComplete} mes{monthsToComplete !== 1 ? 'es' : ''}
                  </span>
                </div>
              )}

              {goal.deadline && monthsToComplete !== null && (
                <div className={`flex items-center gap-2 text-xs font-semibold pt-1 border-t border-slate-100 ${
                  isOnTrack ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {isOnTrack
                    ? <><CheckCircle2 size={14} /> Alcanzable en el plazo</>
                    : <><AlertTriangle size={14} /> No alcanzás el objetivo en el plazo</>
                  }
                </div>
              )}

              {extraNeededMonthly != null && extraNeededMonthly > 0 && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp size={13} className="text-amber-500" />
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                      Para cumplir el plazo
                    </p>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-amber-700">Aporte mensual necesario</span>
                    <span className="text-sm font-bold text-amber-800">
                      {formatCurrency(Math.round((suggestedMonthly ?? 0) + extraNeededMonthly), goal.currency)}/mes
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xs text-amber-600">Extra sobre lo sugerido</span>
                    <span className="text-sm font-bold text-amber-700">
                      + {formatCurrency(Math.round(extraNeededMonthly), goal.currency)}/mes
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {isCompleted && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-semibold p-3 rounded-xl mb-5">
              <CheckCircle2 size={16} />
              ¡Meta alcanzada!
            </div>
          )}

          {/* Agregar aporte */}
          {!addingContrib ? (
            <button
              onClick={() => setAddingContrib(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold mb-5 active:bg-emerald-100 transition-colors"
            >
              <Plus size={16} strokeWidth={2.5} />
              Agregar aporte
            </button>
          ) : (
            <ContribForm
              goal={goal}
              config={config}
              onSave={handleSaveContrib}
              onCancel={() => setAddingContrib(false)}
            />
          )}

          {/* Historial */}
          {sortedContribs.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                Historial de aportes
              </p>
              <div className="space-y-2">
                {sortedContribs.map(c => (
                  <div key={c.id} className="flex items-center gap-3 py-2.5 px-3 bg-slate-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-800">
                          {formatCurrency(c.amount, c.currency ?? goal.currency)}
                        </p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          c.type === 'extraordinario'
                            ? 'bg-violet-100 text-violet-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {c.type === 'extraordinario' ? 'Extra' : 'Mensual'}
                        </span>
                      </div>
                      {c.note && <p className="text-xs text-slate-400 truncate mt-0.5">{c.note}</p>}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 flex-shrink-0">
                      <Clock size={11} />
                      <span className="text-xs">{formatShortDate(c.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ height: 'env(safe-area-inset-bottom, 16px)' }} />
        </div>
      </div>
    </>
  )
}
