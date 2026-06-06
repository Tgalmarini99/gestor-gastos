import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import useStore from '../store/useStore'
import {
  getTotalIncome,
  getBlockBudgets,
  getBlockTotals,
  getCategoryTotals,
  getSavingsTotalByMonth,
  filterExpensesByMonth,
  getCurrentMonth,
} from '../utils/calculations'
import { CATEGORY_BLOCK_MAP } from '../data/categories'
import IncomeCard from '../components/dashboard/IncomeCard'
import BlockSummary from '../components/dashboard/BlockSummary'
import AlertsCard from '../components/dashboard/AlertsCard'
import GoalsCard from '../components/dashboard/GoalsCard'
import SuggestionCard from '../components/dashboard/SuggestionCard'

export default function Dashboard() {
  const { config, incomes, expenses, budgets, goals } = useStore()
  const navigate = useNavigate()

  const currentMonth = useMemo(getCurrentMonth, [])

  const income = useMemo(
    () => incomes.find(i => i.month === currentMonth) ?? null,
    [incomes, currentMonth]
  )

  const monthExpenses = useMemo(
    () => filterExpensesByMonth(expenses, currentMonth),
    [expenses, currentMonth]
  )

  const totalIncome = useMemo(
    () => getTotalIncome(income, config),
    [income, config]
  )

  const blockBudgets = useMemo(
    () => getBlockBudgets(totalIncome),
    [totalIncome]
  )

  const rawBlockTotals = useMemo(
    () => getBlockTotals(monthExpenses, config, CATEGORY_BLOCK_MAP),
    [monthExpenses, config]
  )

  const savingsThisMonth = useMemo(
    () => getSavingsTotalByMonth(goals, currentMonth, config),
    [goals, currentMonth, config]
  )

  const blockTotals = useMemo(
    () => ({ ...rawBlockTotals, savings: savingsThisMonth }),
    [rawBlockTotals, savingsThisMonth]
  )

  const categoryTotals = useMemo(
    () => getCategoryTotals(monthExpenses, config),
    [monthExpenses, config]
  )

  return (
    <div className="relative">
      <IncomeCard income={income} config={config} currentMonth={currentMonth} />

      <div className="space-y-6 py-6">
        <BlockSummary
          blockBudgets={blockBudgets}
          blockTotals={blockTotals}
          baseCurrency={config.baseCurrency}
        />

        <SuggestionCard
          blockBudgets={blockBudgets}
          blockTotals={blockTotals}
          baseCurrency={config.baseCurrency}
        />

        <AlertsCard
          categoryTotals={categoryTotals}
          budgets={budgets}
          config={config}
        />

        <GoalsCard goals={goals} />
      </div>

      <button
        onClick={() => navigate('/gastos')}
        className="fixed bottom-24 right-4 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center active:scale-90 transition-transform z-40"
        aria-label="Registrar gasto"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>
    </div>
  )
}
