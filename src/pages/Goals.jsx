import { useState, useMemo } from 'react'
import { Plus, Target, Shield, TrendingUp, ChevronRight, AlertTriangle } from 'lucide-react'
import useStore from '../store/useStore'
import {
  getGoalDistribution,
  getGoalProgress,
  getFixedMonthlyIncomeARS,
  getCurrentMonth,
} from '../utils/calculations'
import { formatCurrency, formatCompact, formatMonthLabel } from '../utils/formatters'
import ProgressBar from '../components/ui/ProgressBar'
import GoalForm from '../components/goals/GoalForm'
import GoalDetail from '../components/goals/GoalDetail'
import ExtraContribution from '../components/goals/ExtraContribution'

const PRIORITY_COLOR = {
  alta:  'bg-rose-100 text-rose-700',
  media: 'bg-amber-100 text-amber-700',
  baja:  'bg-sky-100 text-sky-700',
}
const PRIORITY_LABEL = { alta: 'Alta', media: 'Media', baja: 'Baja' }
const PRIORITY_ORDER = { alta: 0, media: 1, baja: 2 }

const STATUS_SECTIONS = [
  { key: 'activo',     label: 'Activos'     },
  { key: 'pausado',    label: 'Pausados'    },
  { key: 'completado', label: 'Completados' },
]

function GoalCard({ goal, suggestion, onClick }) {
  const fallback = getGoalProgress(goal)
  const accumulated  = suggestion?.accumulated  ?? fallback.accumulated
  const percentage   = suggestion?.percentage   ?? fallback.percentage
  const { suggestedMonthly, monthsToComplete, isOnTrack, extraNeededMonthly } = suggestion ?? {}
  const isCompleted = goal.status === 'completado' || percentage >= 100

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 active:scale-[0.98] transition-transform cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-sm font-bold text-slate-800 truncate">{goal.name}</p>
            {goal.currency === 'USD' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 bg-emerald-100 text-emerald-700">
                USD
              </span>
            )}
            {goal.priority && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${PRIORITY_COLOR[goal.priority] ?? 'bg-slate-100 text-slate-500'}`}>
                {PRIORITY_LABEL[goal.priority] ?? goal.priority}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {formatCurrency(accumulated, goal.currency)} de {formatCurrency(goal.targetAmount, goal.currency)}
          </p>
        </div>
        <ChevronRight size={16} className="text-slate-300 flex-shrink-0 mt-0.5" />
      </div>

      <ProgressBar
        value={accumulated}
        max={goal.targetAmount}
        colorClass={isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}
        className="mb-3"
      />

      <div className="flex items-center justify-between text-xs">
        {suggestedMonthly !== undefined && !isCompleted ? (
          <span className="text-slate-500">
            Sugerido: <strong className="text-slate-700">{formatCurrency(Math.round(suggestedMonthly), goal.currency)}/mes</strong>
          </span>
        ) : (
          <span />
        )}

        {isCompleted ? (
          <span className="text-emerald-600 font-semibold">✓ Completado</span>
        ) : monthsToComplete != null ? (
          goal.deadline
            ? (isOnTrack
                ? <span className="text-emerald-600 font-semibold">En {monthsToComplete} mes{monthsToComplete !== 1 ? 'es' : ''} ✓</span>
                : <span className="text-amber-600 font-semibold flex items-center gap-0.5"><AlertTriangle size={11} /> {monthsToComplete} meses</span>)
            : <span className="text-slate-500">{monthsToComplete} mes{monthsToComplete !== 1 ? 'es' : ''}</span>
        ) : null}
      </div>

      {extraNeededMonthly != null && extraNeededMonthly > 0 && !isCompleted && (
        <p className="text-xs text-amber-600 mt-2 pt-2 border-t border-amber-100">
          Para llegar al plazo necesitás <strong>{formatCurrency(Math.round(extraNeededMonthly), goal.currency)} extra/mes</strong>
        </p>
      )}
    </div>
  )
}

export default function Goals() {
  const {
    config, goals,
    addGoal, updateGoal, deleteGoal,
    addContribution, addExtraContributions,
  } = useStore()

  const currentMonth = useMemo(getCurrentMonth, [])

  const [showForm, setShowForm]         = useState(false)
  const [editingGoal, setEditingGoal]   = useState(null)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [showExtra, setShowExtra]       = useState(false)

  const monthlyIncomeARS = useMemo(
    () => getFixedMonthlyIncomeARS(config),
    [config]
  )

  const { savingsBlock, emergencyReserve, goalsFund, suggestions } = useMemo(
    () => getGoalDistribution(monthlyIncomeARS, goals, config),
    [monthlyIncomeARS, goals, config]
  )

  const openAdd  = () => { setEditingGoal(null); setShowForm(true) }
  const openEdit = (goal) => { setEditingGoal(goal); setShowForm(true); setSelectedGoal(null) }

  const handleSaveGoal = (data) => {
    if (editingGoal) updateGoal(editingGoal.id, data)
    else addGoal(data)
    setShowForm(false)
    setEditingGoal(null)
  }

  const handleDeleteGoal = () => {
    if (selectedGoal) { deleteGoal(selectedGoal.id); setSelectedGoal(null) }
  }

  const handleSaveExtra = (entries, date) => {
    addExtraContributions(entries, date)
    setShowExtra(false)
  }

  const grouped = useMemo(() => {
    const result = {}
    for (const s of STATUS_SECTIONS) {
      result[s.key] = goals
        .filter(g => (g.status ?? 'activo') === s.key)
        .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1))
    }
    return result
  }, [goals])

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-0 bg-white border-b border-slate-100 z-30">
        <div className="flex items-center justify-between px-4 pt-12 pb-4">
          <h1 className="text-xl font-bold text-slate-800">Objetivos</h1>
          <button
            onClick={openAdd}
            className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center active:scale-90 transition-transform"
            aria-label="Nuevo objetivo"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="pb-8">

        {/* Distribution summary card */}
        {goals.length > 0 && (
          <div className="mx-4 mt-4 mb-2 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl text-white p-4">
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3">
              {formatMonthLabel(currentMonth)} — Distribución del ahorro
            </p>

            {monthlyIncomeARS > 0 ? (
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-white/10 rounded-xl p-2.5 text-center">
                  <TrendingUp size={13} className="mx-auto mb-1 text-white/60" />
                  <p className="text-[9px] text-white/60 mb-0.5">Bloque 20%</p>
                  <p className="text-xs font-bold">{formatCompact(savingsBlock, 'ARS')}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 text-center">
                  <Shield size={13} className="mx-auto mb-1 text-white/60" />
                  <p className="text-[9px] text-white/60 mb-0.5">Emergencia</p>
                  <p className="text-xs font-bold">{formatCompact(emergencyReserve, 'ARS')}</p>
                  <p className="text-[8px] text-white/40">{config.emergencyReservePercent ?? 10}% ing.</p>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 text-center">
                  <Target size={13} className="mx-auto mb-1 text-white/60" />
                  <p className="text-[9px] text-white/60 mb-0.5">Objetivos</p>
                  <p className="text-xs font-bold">{formatCompact(goalsFund, 'ARS')}</p>
                </div>
              </div>
            ) : (
              <p className="text-white/60 text-sm mb-4">
                Configurá tu ingreso mensual en Ajustes para ver la distribución sugerida
              </p>
            )}

            <button
              onClick={() => setShowExtra(true)}
              className="w-full py-2.5 bg-white/20 hover:bg-white/30 active:bg-white/10 rounded-xl text-sm font-bold text-white transition-colors"
            >
              + Aportes extraordinarios
            </button>
          </div>
        )}

        {/* Empty state */}
        {goals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
              <Target size={28} className="text-emerald-400" />
            </div>
            <p className="text-slate-700 font-semibold">Sin objetivos de ahorro</p>
            <p className="text-slate-400 text-sm mt-1">Tocá + para crear el primero</p>
          </div>
        )}

        {/* Sections */}
        {STATUS_SECTIONS.map(section => {
          const list = grouped[section.key] ?? []
          if (list.length === 0) return null
          return (
            <div key={section.key} className="mt-4 px-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                {section.label}
              </p>
              <div className="space-y-3">
                {list.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    suggestion={suggestions[goal.id]}
                    onClick={() => setSelectedGoal(goal)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <GoalForm
        key={editingGoal?.id ?? 'new-goal'}
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingGoal(null) }}
        onSave={handleSaveGoal}
        goal={editingGoal}
      />

      <GoalDetail
        key={selectedGoal?.id ?? 'no-goal'}
        goal={selectedGoal}
        suggestion={selectedGoal ? suggestions[selectedGoal.id] : null}
        config={config}
        isOpen={!!selectedGoal}
        onClose={() => setSelectedGoal(null)}
        onEdit={() => openEdit(selectedGoal)}
        onDelete={handleDeleteGoal}
        onAddContribution={addContribution}
      />

      <ExtraContribution
        isOpen={showExtra}
        onClose={() => setShowExtra(false)}
        onSave={handleSaveExtra}
        goals={goals}
        config={config}
      />
    </div>
  )
}
