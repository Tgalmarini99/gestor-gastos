import { useState, useMemo } from 'react'
import { Plus, Receipt } from 'lucide-react'
import useStore from '../store/useStore'
import { toBaseCurrency } from '../utils/calculations'
import { formatCurrency, formatCompact } from '../utils/formatters'
import { CATEGORY_BLOCK_MAP } from '../data/categories'
import ExpenseItem from '../components/expenses/ExpenseItem'
import ExpenseForm from '../components/expenses/ExpenseForm'

// ── Helpers ───────────────────────────────────────────────────────────────────

const PERIODS = [
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
  { key: 'year', label: 'Año' },
  { key: 'all', label: 'Todo' },
]

function filterByPeriod(expenses, period) {
  const now = new Date()
  if (period === 'week') {
    const cutoff = new Date(now - 7 * 24 * 3600 * 1000).toISOString().split('T')[0]
    return expenses.filter(e => e.date >= cutoff)
  }
  if (period === 'month') {
    const m = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return expenses.filter(e => e.date.startsWith(m))
  }
  if (period === 'year') {
    return expenses.filter(e => e.date.startsWith(String(now.getFullYear())))
  }
  return expenses
}

function groupByDate(expenses) {
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date))
  const groups = {}
  for (const exp of sorted) {
    if (!groups[exp.date]) groups[exp.date] = []
    groups[exp.date].push(exp)
  }
  return groups
}

function formatDateHeader(dateStr) {
  const today = new Date().toISOString().split('T')[0]
  const yday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dateStr === today) return 'Hoy'
  if (dateStr === yday) return 'Ayer'
  const [year, month, day] = dateStr.split('-')
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return year === String(new Date().getFullYear())
    ? `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]}`
    : `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Expenses() {
  const { config, expenses, addExpense, updateExpense, deleteExpense } = useStore()

  const [period, setPeriod] = useState('month')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)

  const filtered = useMemo(() => filterByPeriod(expenses, period), [expenses, period])
  const groups = useMemo(() => groupByDate(filtered), [filtered])

  const { total, needsTotal, wantsTotal } = useMemo(() => {
    let total = 0, needsTotal = 0, wantsTotal = 0
    for (const e of filtered) {
      const amount = toBaseCurrency(e.amount, e.currency, config)
      total += amount
      if (CATEGORY_BLOCK_MAP[e.category] === 'needs') needsTotal += amount
      if (CATEGORY_BLOCK_MAP[e.category] === 'wants') wantsTotal += amount
    }
    return { total, needsTotal, wantsTotal }
  }, [filtered, config])

  const openAdd = () => { setEditingExpense(null); setIsFormOpen(true) }
  const openEdit = (expense) => { setEditingExpense(expense); setIsFormOpen(true) }
  const closeForm = () => { setIsFormOpen(false); setEditingExpense(null) }

  const handleSave = (data) => {
    if (editingExpense) updateExpense(editingExpense.id, data)
    else addExpense(data)
    closeForm()
  }

  const dateKeys = Object.keys(groups)

  return (
    <div>
      {/* ── Sticky header ── */}
      <div className="sticky top-0 bg-white border-b border-slate-100 z-30">
        <div className="flex items-center justify-between px-4 pt-12 pb-3">
          <h1 className="text-xl font-bold text-slate-800">Gastos</h1>
          <button
            onClick={openAdd}
            className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center active:scale-90 transition-transform"
            aria-label="Nuevo gasto"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Period pills */}
        <div className="flex gap-1.5 px-4 pb-3">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                period === p.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Summary bar — only when there are expenses */}
        {dateKeys.length > 0 && (
          <div className="flex items-center gap-4 px-4 pb-3 pt-1 border-t border-slate-50">
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Total</p>
              <p className="text-base font-bold text-slate-800">
                {formatCurrency(total, config.baseCurrency)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-blue-400 uppercase tracking-wide">Necesidades</p>
              <p className="text-sm font-semibold text-slate-700">
                {formatCompact(needsTotal, config.baseCurrency)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-violet-400 uppercase tracking-wide">Deseos</p>
              <p className="text-sm font-semibold text-slate-700">
                {formatCompact(wantsTotal, config.baseCurrency)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Expense list ── */}
      <div className="pb-6">
        {dateKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Receipt size={28} className="text-slate-300" />
            </div>
            <p className="text-slate-600 font-semibold">Sin gastos en este período</p>
            <p className="text-slate-400 text-sm mt-1">Tocá + para registrar el primero</p>
          </div>
        ) : (
          dateKeys.map(date => {
            const items = groups[date]
            const dayTotal = items.reduce(
              (sum, e) => sum + toBaseCurrency(e.amount, e.currency, config),
              0
            )
            return (
              <div key={date}>
                <div className="flex items-center justify-between px-4 pt-5 pb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {formatDateHeader(date)}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    {formatCurrency(dayTotal, config.baseCurrency)}
                  </p>
                </div>
                <div className="bg-white rounded-2xl mx-4 shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
                  {items.map(expense => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      onEdit={openEdit}
                      onDelete={deleteExpense}
                    />
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Form bottom sheet ── */}
      <ExpenseForm
        key={editingExpense?.id ?? 'new'}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={handleSave}
        expense={editingExpense}
      />
    </div>
  )
}
