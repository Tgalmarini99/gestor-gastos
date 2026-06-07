import { getCategoryInfo } from '../data/categories'

function isDismissed(ruleId, dismissed) {
  const entry = dismissed?.find(s => s.ruleId === ruleId)
  if (!entry) return false
  const days = (Date.now() - new Date(entry.dismissedAt).getTime()) / 86400000
  return days < 30
}

// REGLA 1 — Deseos consistentemente por debajo del plan (3 meses)
function rule1_WantsBelow(monthData, config, dismissed) {
  const RULE_ID = 'wants_below_plan'
  if (isDismissed(RULE_ID, dismissed) || monthData.length < 3) return null

  const last3   = monthData.slice(-3)
  const plan    = config.wantsPercent ?? 30
  const allBelow = last3.every(m => m.wantsPct < plan - 5)
  if (!allBelow) return null

  const avg  = last3.reduce((s, m) => s + m.wantsPct, 0) / 3
  const diff = plan - avg
  const xPct = Math.max(5, Math.round(diff / 5) * 5)

  return {
    ruleId: RULE_ID,
    title:  'Deseos por debajo del plan',
    message: `Tus gastos en Deseos fueron ${avg.toFixed(0)}% promedio (plan: ${plan}%). ¿Querés reasignar el excedente al bloque Ahorro?`,
    acceptLabel: `Mover ${xPct}% de Deseos a Ahorro`,
    changes: [
      { type: 'config', field: 'wantsPercent',   oldValue: config.wantsPercent   ?? 30, newValue: (config.wantsPercent   ?? 30) - xPct },
      { type: 'config', field: 'savingsPercent', oldValue: config.savingsPercent ?? 20, newValue: (config.savingsPercent ?? 20) + xPct },
    ],
    detail: {
      type:   'block',
      block:  'wants',
      months: last3.map(m => ({ month: m.month, pct: m.wantsPct })),
      plan,
      avg,
    },
  }
}

// REGLA 2 — Necesidades consistentemente por encima del plan (2 meses)
function rule2_NeedsAbove(monthData, config, dismissed) {
  const RULE_ID = 'needs_above_plan'
  if (isDismissed(RULE_ID, dismissed) || monthData.length < 2) return null

  const last2  = monthData.slice(-2)
  const plan   = config.needsPercent ?? 50
  const allAbove = last2.every(m => m.needsPct > plan + 5)
  if (!allAbove) return null

  const avg      = last2.reduce((s, m) => s + m.needsPct, 0) / 2
  const newNeeds = Math.min(70, Math.round(avg / 5) * 5)
  const diff     = newNeeds - plan
  const newWants   = Math.max(10, (config.wantsPercent   ?? 30) - Math.floor(diff / 2))
  const newSavings = Math.max(10, (config.savingsPercent ?? 20) - Math.ceil(diff  / 2))

  return {
    ruleId: RULE_ID,
    title:  'Necesidades por encima del plan',
    message: `Tus Necesidades superaron el ${plan}% en los últimos 2 meses (promedio: ${avg.toFixed(0)}%). ¿Querés ajustar el plan a ${newNeeds}%?`,
    acceptLabel: `Ajustar Necesidades a ${newNeeds}%`,
    changes: [
      { type: 'config', field: 'needsPercent',   oldValue: config.needsPercent   ?? 50, newValue: newNeeds   },
      { type: 'config', field: 'wantsPercent',   oldValue: config.wantsPercent   ?? 30, newValue: newWants   },
      { type: 'config', field: 'savingsPercent', oldValue: config.savingsPercent ?? 20, newValue: newSavings },
    ],
    detail: {
      type:   'block',
      block:  'needs',
      months: last2.map(m => ({ month: m.month, pct: m.needsPct })),
      plan,
      avg,
    },
  }
}

// REGLA 3 — Tasa de ahorro real superior al plan (3 meses)
function rule3_SavingsAbove(monthData, config, goals, dismissed) {
  const RULE_ID = 'savings_above_plan'
  if (isDismissed(RULE_ID, dismissed) || monthData.length < 3) return null

  const last3  = monthData.slice(-3)
  const plan   = config.savingsPercent ?? 20
  const allAbove = last3.every(m => m.savingsPct > plan * 1.1)
  if (!allAbove) return null

  const avg      = last3.reduce((s, m) => s + m.savingsPct, 0) / 3
  const excessPct = (avg - plan).toFixed(0)

  const targetGoal = goals.find(g => g.status === 'activo' && g.deadline)

  return {
    ruleId: RULE_ID,
    title:  'Ahorrás más de lo planeado',
    message: targetGoal
      ? `Ahorraste un ${avg.toFixed(0)}% promedio (plan: ${plan}%). Al ritmo actual, "${targetGoal.name}" podría adelantarse. ¿Actualizamos la proyección?`
      : `Ahorraste un ${avg.toFixed(0)}% promedio (plan: ${plan}%). Vas muy bien — considerá adelantar algún objetivo.`,
    acceptLabel: 'Entendido, registrar logro',
    changes: [],
    detail: {
      type:   'block',
      block:  'savings',
      months: last3.map(m => ({ month: m.month, pct: m.savingsPct })),
      plan,
      avg,
    },
  }
}

// REGLA 4 — Objetivo en riesgo (por ritmo actual)
function rule4_GoalsAtRisk(projections, dismissed) {
  return (projections ?? [])
    .filter(p => p.isAtRisk)
    .map(p => {
      const RULE_ID = `goal_at_risk_${p.id}`
      if (isDismissed(RULE_ID, dismissed)) return null

      return {
        ruleId: RULE_ID,
        title:  `"${p.name}" en riesgo`,
        message: `Al ritmo actual llegarías en ${p.projectedMonths ?? '∞'} meses (límite: ${p.deadlineMonths} meses). ¿Querés aumentar su prioridad a Alta?`,
        acceptLabel: 'Aumentar prioridad a Alta',
        changes: [
          { type: 'goal', id: p.id, field: 'priority', oldValue: p.priority, newValue: 'alta' }
        ],
        detail: {
          type:            'goal',
          goalId:          p.id,
          projectedMonths: p.projectedMonths,
          deadlineMonths:  p.deadlineMonths,
          monthlyAvg:      p.monthlyAvg,
          currency:        p.currency,
        },
      }
    })
    .filter(Boolean)
}

// REGLA 5 — Categoría recurrentemente excedida (2 meses consecutivos)
function rule5_CategoryOver(monthData, budgets, config, dismissed) {
  if (monthData.length < 2 || !budgets.length) return []

  const last2 = monthData.slice(-2)

  return budgets.map(budget => {
    const RULE_ID = `category_over_${budget.category}`
    if (isDismissed(RULE_ID, dismissed)) return null

    const budgetARS = budget.currency === 'ARS'
      ? budget.monthlyLimit
      : budget.monthlyLimit * (config.bnaRate || 1200)

    const allOver = last2.every(m => (m.categorySpent[budget.category] ?? 0) > budgetARS)
    if (!allOver) return null

    const avg = last2.reduce((s, m) => s + (m.categorySpent[budget.category] ?? 0), 0) / 2
    const info = getCategoryInfo(budget.category)
    const newLimit = Math.round(
      budget.currency === 'ARS' ? avg : avg / (config.bnaRate || 1200)
    )

    return {
      ruleId: RULE_ID,
      title:  `Presupuesto de ${info.label} excedido`,
      message: `Superaste el presupuesto de ${info.label} 2 meses seguidos. ¿Querés ajustarlo a $ ${avg.toLocaleString('es-AR', { maximumFractionDigits: 0 })} (promedio real)?`,
      acceptLabel: `Ajustar presupuesto de ${info.label}`,
      changes: [
        { type: 'budget', category: budget.category, field: 'monthlyLimit', oldValue: budget.monthlyLimit, newValue: newLimit, currency: budget.currency ?? 'ARS' }
      ],
      detail: {
        type:     'category',
        category: budget.category,
        label:    info.label,
        icon:     info.icon,
        months:   last2.map(m => ({ month: m.month, spent: m.categorySpent[budget.category] ?? 0 })),
        budget:   budgetARS,
        avg,
      },
    }
  }).filter(Boolean)
}

export function runSuggestionEngine(monthData, config, goals, budgets, projections, dismissed) {
  const suggestions = []

  const r1 = rule1_WantsBelow(monthData, config, dismissed)
  if (r1) suggestions.push(r1)

  const r2 = rule2_NeedsAbove(monthData, config, dismissed)
  if (r2) suggestions.push(r2)

  const r3 = rule3_SavingsAbove(monthData, config, goals, dismissed)
  if (r3) suggestions.push(r3)

  suggestions.push(...rule4_GoalsAtRisk(projections, dismissed))
  suggestions.push(...rule5_CategoryOver(monthData, budgets, config, dismissed))

  return suggestions
}
