import { Lightbulb } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

export default function SuggestionCard({ blockBudgets, blockTotals, baseCurrency }) {
  const wantsBudget = blockBudgets.wants ?? 0
  const wantsSpent = blockTotals.wants ?? 0
  const savingsBudget = blockBudgets.savings ?? 0
  const savingsSpent = blockTotals.savings ?? 0

  const wantsPct = wantsBudget > 0 ? (wantsSpent / wantsBudget) * 100 : 0
  const savingsPct = savingsBudget > 0 ? (savingsSpent / savingsBudget) * 100 : 0

  let message = null

  if (wantsPct > 90) {
    const excess = wantsSpent - wantsBudget * 0.8
    message = `Gastaste ${Math.round(wantsPct)}% de tu presupuesto de Deseos. Considerá redirigir ${formatCurrency(Math.max(0, excess), baseCurrency)} a Ahorro este mes.`
  } else if (savingsPct < 20 && savingsBudget > 0) {
    const toSave = savingsBudget - savingsSpent
    message = `Todavía no registraste ahorros este mes. Tu meta es ${formatCurrency(savingsBudget, baseCurrency)} — programá una transferencia de ${formatCurrency(toSave, baseCurrency)}.`
  }

  if (!message) return null

  return (
    <section className="px-4">
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
        <Lightbulb size={18} className="flex-shrink-0 text-amber-500 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-700 mb-0.5">Sugerencia</p>
          <p className="text-sm text-amber-900 leading-relaxed">{message}</p>
        </div>
      </div>
    </section>
  )
}
