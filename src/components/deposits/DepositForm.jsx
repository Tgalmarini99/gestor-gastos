import { useState } from 'react'
import { X } from 'lucide-react'

const todayStr = () => new Date().toISOString().split('T')[0]

function initForm(currency) {
  return {
    amount: '',
    currency: currency ?? 'ARS',
    description: 'Sueldo',
    date: todayStr(),
  }
}

export default function DepositForm({ isOpen, onClose, onSave, initialCurrency = 'ARS' }) {
  const [form, setForm] = useState(() => initForm(initialCurrency))
  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const isValid = Number(form.amount) > 0

  const handleSave = () => {
    if (!isValid) return
    onSave({
      amount: Number(form.amount),
      currency: form.currency,
      description: form.description.trim() || 'Depósito',
      date: form.date || todayStr(),
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
        className={`fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-3xl z-[60] flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '92dvh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-2.5 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
          <h2 className="text-base font-bold text-slate-800">Agregar dinero</h2>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`text-sm font-bold transition-colors ${
              isValid ? 'text-emerald-600' : 'text-slate-300'
            }`}
          >
            Guardar
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">

          {/* Currency + Amount */}
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-4">
              {['ARS', 'USD'].map(c => (
                <button
                  key={c}
                  onClick={() => set('currency', c)}
                  className={`px-5 py-1.5 rounded-full text-sm font-bold transition-colors ${
                    form.currency === c
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-bold text-slate-300">
                {form.currency === 'ARS' ? '$' : 'U$S'}
              </span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                className="w-44 text-4xl font-bold text-slate-800 text-center border-b-2 border-slate-200 focus:border-emerald-500 pb-1 outline-none bg-transparent"
                autoFocus={isOpen}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Descripción
            </label>
            <input
              type="text"
              placeholder="Ej: Sueldo, Transferencia…"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Fecha
            </label>
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div style={{ height: 'env(safe-area-inset-bottom, 16px)' }} />
        </div>
      </div>
    </>
  )
}
