import { useState, useMemo } from 'react'
import { X, Info } from 'lucide-react'
import { formatCurrency, formatMonthLabel } from '../../utils/formatters'

function initForm(income, config) {
  return {
    amountARS: income?.amountARS ?? 0,
    amountUSD: income?.amountUSD ?? 0,
    exchangeRate: config.exchangeRate,
  }
}

export default function IncomeForm({ isOpen, onClose, onSave, income, config, currentMonth }) {
  const [form, setForm] = useState(() => initForm(income, config))
  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const total = useMemo(() => {
    const ars = Number(form.amountARS) || 0
    const usd = Number(form.amountUSD) || 0
    const tc = Number(form.exchangeRate) || 0
    return config.baseCurrency === 'ARS' ? ars + usd * tc : ars / tc + usd
  }, [form, config.baseCurrency])

  const handleSave = () => {
    onSave({
      amountARS: Number(form.amountARS) || 0,
      amountUSD: Number(form.amountUSD) || 0,
      exchangeRate: Number(form.exchangeRate) || 0,
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
          <button
            onClick={handleSave}
            className="text-sm font-bold text-indigo-600"
          >
            Guardar
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">

          {/* Income fields */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Ingresos del mes
            </p>

            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3">
              <span className="text-sm font-bold text-slate-400 w-10">ARS</span>
              <span className="text-slate-300">$</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={form.amountARS || ''}
                onChange={e => set('amountARS', e.target.value)}
                className="flex-1 text-right text-lg font-bold text-slate-800 bg-transparent outline-none"
              />
            </div>

            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3">
              <span className="text-sm font-bold text-slate-400 w-10">USD</span>
              <span className="text-slate-300">$</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={form.amountUSD || ''}
                onChange={e => set('amountUSD', e.target.value)}
                className="flex-1 text-right text-lg font-bold text-slate-800 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Exchange rate */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Tipo de cambio
            </p>

            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3">
              <span className="text-sm font-bold text-slate-400 w-10">TC</span>
              <span className="text-slate-300">$</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={form.exchangeRate || ''}
                onChange={e => set('exchangeRate', e.target.value)}
                className="flex-1 text-right text-lg font-bold text-slate-800 bg-transparent outline-none"
              />
              <span className="text-xs text-slate-400 flex-shrink-0">ARS/USD</span>
            </div>

            {/* TC hint */}
            <div className="flex gap-2.5 bg-blue-50 rounded-2xl px-4 py-3">
              <Info size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-700 mb-0.5">
                  Banco Nación — último día hábil
                </p>
                <p className="text-xs text-blue-600 leading-relaxed">
                  TC = (compra + venta) ÷ 2
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  Ej: compra $1.180 + venta $1.220 → TC $1.200
                </p>
              </div>
            </div>
          </div>

          {/* Live preview */}
          {(Number(form.amountUSD) > 0 || Number(form.amountARS) > 0) && Number(form.exchangeRate) > 0 && (
            <div className="bg-indigo-50 rounded-2xl px-4 py-4">
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">
                Total estimado
              </p>
              <p className="text-2xl font-bold text-indigo-700">
                {formatCurrency(total, config.baseCurrency)}
              </p>
              {Number(form.amountUSD) > 0 && Number(form.amountARS) > 0 && (
                <p className="text-xs text-indigo-400 mt-0.5">
                  {formatCurrency(Number(form.amountARS), 'ARS')} +{' '}
                  {formatCurrency(Number(form.amountUSD), 'USD')} × ${Number(form.exchangeRate).toLocaleString('es-AR')}
                </p>
              )}
            </div>
          )}

          <div style={{ height: 'env(safe-area-inset-bottom, 16px)' }} />
        </div>
      </div>
    </>
  )
}
