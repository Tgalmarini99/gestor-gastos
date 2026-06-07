import { useState } from 'react'
import { Trash2, CreditCard } from 'lucide-react'
import { getCategoryInfo, CATEGORY_BLOCK_MAP } from '../../data/categories'
import { formatCurrency } from '../../utils/formatters'

export default function ExpenseItem({ expense, onEdit, onDelete, onDeleteGroup }) {
  const [confirming, setConfirming] = useState(false)
  const cat = getCategoryInfo(expense.category)
  const block = CATEGORY_BLOCK_MAP[expense.category]
  const isInstallment = !!expense.installmentGroupId
  const isCreditCard  = isInstallment || !!expense.isCreditCard

  if (confirming) {
    if (isInstallment) {
      return (
        <div className="px-4 py-3 bg-red-50">
          <p className="text-xs font-semibold text-red-700 mb-2">
            Cuota {expense.installmentNumber}/{expense.installmentTotal} — ¿qué eliminar?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-600 border border-slate-200"
            >
              Cancelar
            </button>
            <button
              onClick={() => onDelete(expense.id)}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-red-400 text-white"
            >
              Esta cuota
            </button>
            <button
              onClick={() => onDeleteGroup(expense.installmentGroupId)}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white"
            >
              Todas ({expense.installmentTotal})
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-3 px-4 py-3.5 bg-red-50">
        <p className="flex-1 text-sm font-medium text-red-700">¿Eliminar este gasto?</p>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-600 border border-slate-200"
        >
          Cancelar
        </button>
        <button
          onClick={() => onDelete(expense.id)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white"
        >
          Eliminar
        </button>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 cursor-pointer"
      onClick={() => onEdit(expense)}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
          block === 'needs' ? 'bg-blue-50' : 'bg-violet-50'
        }`}
      >
        {cat.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-slate-800">{cat.label}</p>
          {isCreditCard && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-violet-600 bg-violet-100 rounded-full px-1.5 py-0.5 flex-shrink-0">
              <CreditCard size={9} strokeWidth={2.5} />
              {isInstallment ? `${expense.installmentNumber}/${expense.installmentTotal}` : '1x'}
            </span>
          )}
        </div>
        {expense.description && (
          <p className="text-xs text-slate-400 truncate">{expense.description}</p>
        )}
      </div>

      <p className="text-sm font-bold text-slate-800 flex-shrink-0">
        {formatCurrency(expense.amount, expense.currency)}
      </p>

      <button
        className="flex-shrink-0 p-1.5 text-slate-300 active:text-red-400 transition-colors"
        onClick={e => { e.stopPropagation(); setConfirming(true) }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
