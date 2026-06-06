import { useState, useMemo } from 'react'
import { X, Zap } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

const todayStr = () => new Date().toISOString().split('T')[0]

function toARS(amount, currency, tc) {
  return currency === 'ARS' ? amount : amount * tc
}

export default function ExtraContribution({ isOpen, onClose, onSave, goals, config }) {
  const tc = config.exchangeRate || 1200
  const activeGoals = goals.filter(g => g.status === 'activo')

  const [available, setAvailable] = useState({ amount: '', currency: 'ARS' })
  const [entries, setEntries] = useState(() =>
    Object.fromEntries(activeGoals.map(g => [g.id, { amount: '', note: '' }]))
  )
  const [date, setDate] = useState(todayStr)

  const setEntry = (goalId, field, value) =>
    setEntries(prev => ({ ...prev, [goalId]: { ...prev[goalId], [field]: value } }))

  const availableARS = useMemo(
    () => toARS(Number(available.amount) || 0, available.currency, tc),
    [available, tc]
  )

  const assignedARS = useMemo(
    () => activeGoals.reduce((sum, g) => sum + toARS(Number(entries[g.id]?.amount) || 0, g.currency, tc), 0),
    [entries, activeGoals, tc]
  )

  const remainingARS = Math.max(0, availableARS - assignedARS)
  const overage = assignedARS > availableARS && availableARS > 0

  // Pre-fill con los montos sugeridos (proporcional al disponible)
  const handleAutoDistribute = (suggestions) => {
    if (!suggestions || availableARS <= 0) return
    const newEntries = { ...entries }
    for (const g of activeGoals) {
      const s = suggestions[g.id]
      if (!s) continue
      const suggestedARS = toARS(s.suggestedMonthly, g.currency, tc) // suggestedMonthly está en currency del goal
      // Distribuir proporcionalmente al disponible
      const newEntries2 = { ...newEntries }
      newEntries2[g.id] = {
        ...newEntries[g.id],
        amount: g.currency === 'ARS'
          ? String(Math.round(s.suggestedMonthly))
          : String(Math.round(s.suggestedMonthly * 100) / 100),
      }
      Object.assign(newEntries, newEntries2)
    }
    setEntries(newEntries)
  }

  const hasAnyEntry = activeGoals.some(g => Number(entries[g.id]?.amount) > 0)
  const canSave = hasAnyEntry && !overage

  const handleSave = () => {
    if (!canSave) return
    const validEntries = activeGoals
      .filter(g => Number(entries[g.id]?.amount) > 0)
      .map(g => ({
        goalId: g.id,
        amount: Number(entries[g.id].amount),
        currency: g.currency,
        note: entries[g.id].note || '',
      }))
    onSave(validEntries, date)
  }

  if (activeGoals.length === 0) {
    return (
      <>
        <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
        <div className={`fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-3xl z-[60] flex flex-col transition-transform duration-300 p-8 text-center ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <p className="text-slate-500 font-medium">No hay objetivos activos</p>
          <button onClick={onClose} className="mt-4 text-indigo-600 font-semibold text-sm">Cerrar</button>
        </div>
      </>
    )
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

        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 flex-shrink-0">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
          <h2 className="text-base font-bold text-slate-800">Aportes extraordinarios</h2>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`text-sm font-bold transition-colors ${canSave ? 'text-emerald-600' : 'text-slate-300'}`}
          >
            Confirmar
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">

          {/* Disponible */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Monto disponible para distribuir
            </label>
            <div className="flex gap-2">
              <div className="flex gap-1 flex-shrink-0">
                {['ARS', 'USD'].map(c => (
                  <button
                    key={c}
                    onClick={() => setAvailable(a => ({ ...a, currency: c }))}
                    className={`px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                      available.currency === c
                        ? 'bg-indigo-600 text-white'
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
                value={available.amount}
                onChange={e => setAvailable(a => ({ ...a, amount: e.target.value }))}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Contador */}
          {availableARS > 0 && (
            <div className={`rounded-xl p-3 ${overage ? 'bg-red-50' : 'bg-slate-50'}`}>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className={overage ? 'text-red-600' : 'text-slate-600'}>
                  Asignado: {formatCurrency(Math.round(assignedARS), 'ARS')}
                </span>
                <span className="text-slate-500">
                  Disponible: {formatCurrency(Math.round(availableARS), 'ARS')}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${overage ? 'bg-red-400' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, availableARS > 0 ? (assignedARS / availableARS) * 100 : 0)}%` }}
                />
              </div>
              {!overage && remainingARS > 0 && (
                <p className="text-xs text-slate-400 mt-1.5">
                  Quedan {formatCurrency(Math.round(remainingARS), 'ARS')} sin asignar
                </p>
              )}
              {overage && (
                <p className="text-xs text-red-500 font-medium mt-1.5">
                  Excedés el monto disponible
                </p>
              )}
            </div>
          )}

          {/* Objetivos */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
              Objetivos activos
            </p>
            <div className="space-y-3">
              {activeGoals.map(g => (
                <div key={g.id} className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-800 truncate pr-2">{g.name}</p>
                    <span className="text-xs text-slate-400 flex-shrink-0">{g.currency}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-sm text-slate-400 font-bold">
                        {g.currency === 'ARS' ? '$' : 'U$S'}
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="0"
                        value={entries[g.id]?.amount ?? ''}
                        onChange={e => setEntry(g.id, 'amount', e.target.value)}
                        className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="nota"
                      value={entries[g.id]?.note ?? ''}
                      onChange={e => setEntry(g.id, 'note', e.target.value)}
                      className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 'env(safe-area-inset-bottom, 16px)' }} />
        </div>
      </div>
    </>
  )
}
