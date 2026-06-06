import { useState } from 'react'
import { X } from 'lucide-react'
import { CATEGORIES } from '../../data/categories'

const todayStr = () => new Date().toISOString().split('T')[0]

function initForm(expense) {
  return {
    amount: expense?.amount ?? '',
    currency: expense?.currency ?? 'ARS',
    category: expense?.category ?? '',
    description: expense?.description ?? '',
    date: expense?.date ?? todayStr(),
  }
}

export default function ExpenseForm({ isOpen, onClose, onSave, expense = null }) {
  const [form, setForm] = useState(() => initForm(expense))

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))
  const isValid = Number(form.amount) > 0 && form.category !== ''

  const handleSave = () => {
    if (!isValid) return
    onSave({
      amount: Number(form.amount),
      currency: form.currency,
      category: form.category,
      description: form.description.trim(),
      date: form.date || todayStr(),
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-3xl z-50 flex flex-col transition-transform duration-300 ${
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
          <h2 className="text-base font-bold text-slate-800">
            {expense ? 'Editar gasto' : 'Nuevo gasto'}
          </h2>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`text-sm font-bold transition-colors ${
              isValid ? 'text-indigo-600' : 'text-slate-300'
            }`}
          >
            Guardar
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-6">

          {/* Amount + Currency */}
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-4">
              {['ARS', 'USD'].map(c => (
                <button
                  key={c}
                  onClick={() => set('currency', c)}
                  className={`px-5 py-1.5 rounded-full text-sm font-bold transition-colors ${
                    form.currency === c
                      ? 'bg-indigo-600 text-white'
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
                className="w-44 text-4xl font-bold text-slate-800 text-center border-b-2 border-slate-200 focus:border-indigo-500 pb-1 outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-2">
              Necesidades
            </p>
            <div className="grid grid-cols-5 gap-1.5 mb-4">
              {CATEGORIES.needs.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => set('category', cat.id)}
                  className={`flex flex-col items-center py-2 px-1 rounded-xl transition-colors ${
                    form.category === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="text-xl leading-none">{cat.icon}</span>
                  <span className="text-[9px] font-medium text-center leading-tight mt-1 break-words w-full">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-[11px] font-bold text-violet-500 uppercase tracking-wider mb-2">
              Deseos
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {CATEGORIES.wants.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => set('category', cat.id)}
                  className={`flex flex-col items-center py-2 px-1 rounded-xl transition-colors ${
                    form.category === cat.id
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="text-xl leading-none">{cat.icon}</span>
                  <span className="text-[9px] font-medium text-center leading-tight mt-1 break-words w-full">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Descripción <span className="font-normal normal-case">(opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Delivery de pizza"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div style={{ height: 'env(safe-area-inset-bottom, 16px)' }} />
        </div>
      </div>
    </>
  )
}
