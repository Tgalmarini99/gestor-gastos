import { useMemo, useState } from 'react'
import useStore from '../store/useStore'
import Card from '../components/ui/Card'
import PeriodSelector from '../components/tracking/PeriodSelector'
import BlockChart from '../components/tracking/BlockChart'
import DeviationCards from '../components/tracking/DeviationCards'
import CategoryDeviations from '../components/tracking/CategoryDeviations'
import SavingsRate from '../components/tracking/SavingsRate'
import GoalProjections from '../components/tracking/GoalProjections'
import SuggestionCard from '../components/tracking/SuggestionCard'
import ChangesHistory from '../components/tracking/ChangesHistory'
import {
  getPeriodMonths,
  getMonthData,
  getAvgDeviations,
  getCategoryDeviations,
  getSavingsRateData,
  getGoalProjections,
} from '../utils/trackingCalculations'
import { runSuggestionEngine } from '../utils/suggestionEngine'
import { getFixedMonthlyIncomeARS } from '../utils/calculations'

const SECTIONS = [
  { id: 'blocks',      label: '50/30/20'      },
  { id: 'categories',  label: 'Categorías'    },
  { id: 'savings',     label: 'Ahorro'        },
  { id: 'goals',       label: 'Objetivos'     },
]

function SectionTab({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-1 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
        active
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-slate-400'
      }`}
    >
      {label}
    </button>
  )
}

export default function Tracking() {
  const {
    config, expenses, goals, budgets,
    dismissedSuggestions, ruleChangesHistory,
    dismissSuggestion, acceptSuggestion,
  } = useStore()

  const [period, setPeriod]   = useState(3)
  const [section, setSection] = useState('blocks')

  const hasIncome = (config.monthlyIncomeUSD ?? 0) > 0

  const months = useMemo(() => getPeriodMonths(period), [period])

  const monthData = useMemo(
    () => months.map(m => getMonthData(m, expenses, goals, config)),
    [months, expenses, goals, config]
  )

  const avgs = useMemo(() => getAvgDeviations(monthData, config), [monthData, config])

  const catDeviations = useMemo(
    () => getCategoryDeviations(monthData, budgets, config),
    [monthData, budgets, config]
  )

  const savingsRate = useMemo(() => getSavingsRateData(monthData, config), [monthData, config])

  const projections = useMemo(() => getGoalProjections(goals, config), [goals, config])

  // Suggestion engine uses last 3 months regardless of selected period
  const last3Data = useMemo(() => {
    const last3Months = getPeriodMonths(3)
    return last3Months.map(m => getMonthData(m, expenses, goals, config))
  }, [expenses, goals, config])

  const suggestions = useMemo(
    () => runSuggestionEngine(last3Data, config, goals, budgets, projections, dismissedSuggestions),
    [last3Data, config, goals, budgets, projections, dismissedSuggestions]
  )

  if (!hasIncome) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-xl font-bold text-slate-800 mb-1">Análisis</h1>
        <p className="text-slate-400 text-sm mb-8">Seguimiento de tus patrones financieros</p>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-slate-700 font-semibold mb-1">Configurá tu ingreso mensual</p>
          <p className="text-slate-400 text-sm">
            Para ver el análisis necesitás configurar tu ingreso fijo en Ajustes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-100 z-30 px-4 pt-12 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-slate-800">Análisis</h1>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>
        {/* Section tabs */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {SECTIONS.map(s => (
            <SectionTab
              key={s.id}
              active={section === s.id}
              label={s.label}
              onClick={() => setSection(s.id)}
            />
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">

        {/* SECCIÓN: 50/30/20 */}
        {section === 'blocks' && (
          <>
            <Card className="p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                Evolución por bloque
              </h2>
              <BlockChart monthData={monthData} config={config} />
            </Card>

            <Card className="p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                Desvío promedio del período
              </h2>
              <DeviationCards avgs={avgs} />
            </Card>
          </>
        )}

        {/* SECCIÓN: Categorías */}
        {section === 'categories' && (
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">
              Categorías con mayor desvío
            </h2>
            <CategoryDeviations data={catDeviations} />
          </Card>
        )}

        {/* SECCIÓN: Ahorro */}
        {section === 'savings' && (
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">
              Tasa real de ahorro
            </h2>
            <SavingsRate data={savingsRate} />
          </Card>
        )}

        {/* SECCIÓN: Objetivos */}
        {section === 'goals' && (
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">
              Proyección al ritmo actual
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Basado en el promedio de aportes de los últimos 3 meses
            </p>
            <GoalProjections projections={projections} />
          </Card>
        )}

        {/* Motor de sugerencias (siempre visible) */}
        {suggestions.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Sugerencias automáticas
            </h2>
            <div className="space-y-3">
              {suggestions.map(s => (
                <SuggestionCard
                  key={s.ruleId}
                  suggestion={s}
                  onAccept={acceptSuggestion}
                  onDismiss={dismissSuggestion}
                />
              ))}
            </div>
          </div>
        )}

        {/* Historial de cambios */}
        <ChangesHistory history={ruleChangesHistory} />

      </div>
    </div>
  )
}
