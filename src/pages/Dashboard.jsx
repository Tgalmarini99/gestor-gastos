import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import useStore from '../store/useStore'
import {
  getCurrentBalance,
  getMonthlyBalance,
  getFixedMonthlyIncomeARS,
  getBlockBudgets,
  getBlockTotals,
  getCategoryTotals,
  getSavingsTotalByMonth,
  filterExpensesByMonth,
  getCurrentMonth,
} from '../utils/calculations'
import { CATEGORY_BLOCK_MAP } from '../data/categories'
import BalanceCard from '../components/dashboard/BalanceCard'
import BlockSummary from '../components/dashboard/BlockSummary'
import AlertsCard from '../components/dashboard/AlertsCard'
import GoalsCard from '../components/dashboard/GoalsCard'
import SuggestionCard from '../components/dashboard/SuggestionCard'
import DepositForm from '../components/deposits/DepositForm'

export default function Dashboard() {
  const { config, deposits, expenses, budgets, goals, addDeposit, fetchAndUpdateBnaRate } = useStore()
  const navigate = useNavigate()

  const [depositForm, setDepositForm] = useState({ open: false, currency: 'ARS' })

  const currentMonth = useMemo(getCurrentMonth, [])

  useEffect(() => { fetchAndUpdateBnaRate() }, [])

  // ── Balance global por moneda (sin conversión) ───────────────────────────
  const { arsBalance, usdBalance } = useMemo(
    () => getCurrentBalance(deposits, expenses),
    [deposits, expenses]
  )

  // ── Datos del mes actual ──────────────────────────────────────────────────
  const monthExpenses = useMemo(
    () => filterExpensesByMonth(expenses, currentMonth),
    [expenses, currentMonth]
  )

  const monthly = useMemo(
    () => getMonthlyBalance(deposits, expenses, currentMonth),
    [deposits, expenses, currentMonth]
  )

  // ── 50/30/20 — basado en ingreso mensual fijo configurado ───────────────
  const monthIn = useMemo(
    () => getFixedMonthlyIncomeARS(config),
    [config]
  )

  const blockBudgets = useMemo(
    () => getBlockBudgets(monthIn),
    [monthIn]
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

  const handleSaveDeposit = (data) => {
    addDeposit(data)
    setDepositForm({ open: false, currency: 'ARS' })
  }

  return (
    <div className="relative">
      <BalanceCard
        arsBalance={arsBalance}
        usdBalance={usdBalance}
        monthly={monthly}
        currentMonth={currentMonth}
        onAddARS={() => setDepositForm({ open: true, currency: 'ARS' })}
        onAddUSD={() => setDepositForm({ open: true, currency: 'USD' })}
      />

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

      {/* FAB — registrar gasto */}
      <button
        onClick={() => navigate('/gastos')}
        className="fixed bottom-24 right-4 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center active:scale-90 transition-transform z-40"
        aria-label="Registrar gasto"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <DepositForm
        key={depositForm.open ? 'open' : 'closed'}
        isOpen={depositForm.open}
        onClose={() => setDepositForm({ open: false, currency: 'ARS' })}
        onSave={handleSaveDeposit}
        initialCurrency={depositForm.currency}
      />
    </div>
  )
}
