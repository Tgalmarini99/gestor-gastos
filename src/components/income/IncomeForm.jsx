import { useState, useMemo } from 'react'
import { X } from 'lucide-react'
import { formatCurrency, formatMonthLabel } from '../../utils/formatters'
import { getTotalIncome } from '../../utils/calculations'

const DEFAULT_USD = 510 // 20% de USD 2.550

function initForm(income) {
  return {
    amountARS: income?.amountARS ?? 0,
    amountUSD: income?.amountUSD ?? DEFAULT_USD,
  }
}

export default function IncomeForm({ isOpen, onClose, onSave, income, config, currentMonth }) {
  const [form, setForm] = useState(() => initForm(income))
  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const total = useMemo(
    () => getTotalIncome({ amountARS: Number(form.amountARS) || 0, amountUSD: Number(form.amountUSD) || 0 }, config),
    [form, config]
  )

  const handleSave = () => {
    onSave({
      amountARS: Number(form.amountARS) || 0,
      amountUSD: Number(form.amountUSD) || DEFAULT_USD,
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

      {/* Sheet */}
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
          <div className="text-center">
            <h2 className="text-base font-bold text-slate-800">Ingresos</h2>
            <p className="text-xs text-slate-400">{formatMonthLabel(currentMonth)}</p>
          </div>
          <button onClick={handleSave} className="text-sm font-bold text-indigo-600">
            Guardar
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-6 space-y-4">

          {/* ARS — principal, cambia cada mes */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Ingresos en pesos
            </label>
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-4">
              <span className="text-slate-400 font-bold">$</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={form.amountARS || ''}
                onChange={e => set('amountARS', e.target.value)}
                className="flex-1 text-right text-2xl font-bold text-slate-800 bg-transparent outline-none"
                autoFocus={isOpen}
              />
              <span className="text-xs font-semibold text-slate-400">ARS</span>
            </div>
          </div>

          {/* USD — fijo, pre-llenado con 2550 */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Ingresos en dólares
            </label>
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-4">
              <span className="text-slate-400 font-bold">$</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder={String(DEFAULT_USD)}
                value={form.amountUSD || ''}
                onChange={e => set('amountUSD', e.target.value)}
                className="flex-1 text-right text-2xl font-bold text-slate-800 bg-transparent outline-none"
              />
              <span className="text-xs font-semibold text-slate-400">USD</span>
            </div>
          </div>

          {/* Preview total */}
          {(Number(form.amountARS) > 0 || Number(form.amountUSD) > 0) && (
            <div className="bg-indigo-50 rounded-2xl px-4 py-4">
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">
                Total estimado
              </p>
              <p className="text-2xl font-bold text-indigo-700">
                {formatCurrency(total, config.baseCurrency)}
              </p>
              <p className="text-xs text-indigo-400 mt-0.5">
                TC aplicado: $ {config.exchangeRate.toLocaleString('es-AR')} — ajustable en Ajustes
              </p>
            </div>
          )}

          <div style={{ height: 'env(safe-area-inset-bottom, 16px)' }} />
        </div>
      </div>
    </>
  )
}
