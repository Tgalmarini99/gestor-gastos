import { useState } from 'react'
import { X } from 'lucide-react'

const todayStr = () => new Date().toISOString().split('T')[0]

const PRIORITIES = [
  { id: 'alta',  label: 'Alta',  bg: 'bg-rose-500',   ring: 'ring-rose-400'  },
  { id: 'media', label: 'Media', bg: 'bg-amber-500',  ring: 'ring-amber-400' },
  { id: 'baja',  label: 'Baja',  bg: 'bg-sky-500',    ring: 'ring-sky-400'   },
]

const STATUSES = [
  { id: 'activo',     label: 'Activo'     },
  { id: 'pausado',    label: 'Pausado'    },
  { id: 'completado', label: 'Completado' },
]

function initForm(goal) {
  return {
    name:         goal?.name         ?? '',
    targetAmount: goal?.targetAmount ?? '',
    currency:     goal?.currency     ?? 'ARS',
    deadline:     goal?.deadline     ?? '',
    priority:     goal?.priority     ?? 'media',
    status:       goal?.status       ?? 'activo',
  }
}

export default function GoalForm({ isOpen, onClose, onSave, goal = null }) {
  const [form, setForm] = useState(() => initForm(goal))
  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }))

  const isValid = form.name.trim() && Number(form.targetAmount) > 0

  const handleSave = () => {
    if (!isValid) return
    onSave({
      name:         form.name.trim(),
      targetAmount: Number(form.targetAmount),
      currency:     form.currency,
      deadline:     form.deadline || null,
      priority:     form.priority,
      status:       form.status,
    })
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
        className={`fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-3xl z-50 flex flex-col transition-transform duration-300 ${
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
          <h2 className="text-base font-bold text-slate-800">
            {goal ? 'Editar objetivo' : 'Nuevo objetivo'}
          </h2>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`text-sm font-bold transition-colors ${isValid ? 'text-emerald-600' : 'text-slate-300'}`}
          >
            Guardar
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">

          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Nombre del objetivo
            </label>
            <input
              type="text"
              placeholder="Ej: Viaje a Europa, Auto nuevo…"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Monto meta + moneda */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Monto meta
            </label>
            <div className="flex gap-2">
              <div className="flex gap-1 flex-shrink-0">
                {['ARS', 'USD'].map(c => (
                  <button
                    key={c}
                    onClick={() => set('currency', c)}
                    className={`px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
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
                value={form.targetAmount}
                onChange={e => set('targetAmount', e.target.value)}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Fecha límite */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Fecha límite <span className="font-normal normal-case">(opcional)</span>
            </label>
            <input
              type="date"
              value={form.deadline ?? ''}
              min={todayStr()}
              onChange={e => set('deadline', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Prioridad
            </label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p.id}
                  onClick={() => set('priority', p.id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    form.priority === p.id
                      ? `${p.bg} text-white ring-2 ${p.ring} ring-offset-1`
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Estado — solo al editar */}
          {goal && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                Estado
              </label>
              <div className="flex gap-2">
                {STATUSES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => set('status', s.id)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      form.status === s.id
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {s.label}
                  </button>
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
