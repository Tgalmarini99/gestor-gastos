import { CATEGORY_BLOCK_MAP, getCategoryInfo } from '../data/categories'
import { getFixedMonthlyIncomeARS } from './calculations'

// Last n complete months (not current month), oldest → newest
export function getPeriodMonths(n) {
  const months = []
  const now = new Date()
  for (let i = n; i >= 1; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

function toARS(amount, currency, bnaRate) {
  return currency === 'ARS' ? amount : amount * (bnaRate || 1200)
}

// Analysis data for a single month
export function getMonthData(month, expenses, goals, config) {
  const income = getFixedMonthlyIncomeARS(config)
  const monthExps = expenses.filter(e => e.date.startsWith(month))

  let needsSpent = 0
  let wantsSpent = 0
  const categorySpent = {}

  for (const exp of monthExps) {
    const block = CATEGORY_BLOCK_MAP[exp.category]
    const amountARS = toARS(exp.amount, exp.currency, config.bnaRate)
    if (block === 'needs') needsSpent += amountARS
    else if (block === 'wants') wantsSpent += amountARS
    categorySpent[exp.category] = (categorySpent[exp.category] || 0) + amountARS
  }

  const savingsReal = goals.reduce((sum, g) =>
    sum + g.contributions
      .filter(c => c.date.startsWith(month))
      .reduce((s, c) => s + toARS(c.amount, c.currency ?? g.currency, config.bnaRate), 0)
  , 0)

  return {
    month,
    income,
    needsSpent,
    wantsSpent,
    savingsReal,
    needsPct:   income ? (needsSpent  / income) * 100 : 0,
    wantsPct:   income ? (wantsSpent  / income) * 100 : 0,
    savingsPct: income ? (savingsReal / income) * 100 : 0,
    categorySpent,
  }
}

// Average deviations from plan across a set of month-data objects
export function getAvgDeviations(monthData, config) {
  const n = monthData.length
  if (!n) return null

  const needsPlan   = config.needsPercent   ?? 50
  const wantsPlan   = config.wantsPercent   ?? 30
  const savingsPlan = config.savingsPercent ?? 20

  const needsAvg   = monthData.reduce((s, m) => s + m.needsPct,   0) / n
  const wantsAvg   = monthData.reduce((s, m) => s + m.wantsPct,   0) / n
  const savingsAvg = monthData.reduce((s, m) => s + m.savingsPct, 0) / n

  return {
    needsPlan,   needsAvg,   needsDev:   needsAvg   - needsPlan,
    wantsPlan,   wantsAvg,   wantsDev:   wantsAvg   - wantsPlan,
    savingsPlan, savingsAvg, savingsDev: savingsAvg - savingsPlan,
  }
}

// Top 3 over-budget and top 3 under-budget categories
export function getCategoryDeviations(monthData, budgets, config) {
  const n = monthData.length
  if (!n || !budgets.length) return { over: [], under: [] }

  const avgSpent = {}
  for (const m of monthData) {
    for (const [cat, amount] of Object.entries(m.categorySpent)) {
      avgSpent[cat] = (avgSpent[cat] || 0) + amount / n
    }
  }

  const deviations = budgets
    .map(budget => {
      const budgetARS = toARS(budget.monthlyLimit, budget.currency ?? 'ARS', config.bnaRate)
      const avg = avgSpent[budget.category] ?? 0
      const info = getCategoryInfo(budget.category)
      return {
        category: budget.category,
        label: info.label,
        icon: info.icon,
        avgAmount: avg,
        budgetARS,
        deviation: avg - budgetARS,
      }
    })
    .filter(d => d.budgetARS > 0)
    .sort((a, b) => b.deviation - a.deviation)

  return {
    over:  deviations.filter(d => d.deviation > 0).slice(0, 3),
    under: deviations.filter(d => d.deviation < 0).slice(-3).reverse(),
  }
}

// Savings rate data for each month in the period
export function getSavingsRateData(monthData, config) {
  const savingsPlan = config.savingsPercent ?? 20
  const total = { real: 0, suggested: 0 }

  const rows = monthData.map(m => {
    const suggested = m.income * (savingsPlan / 100)
    total.real      += m.savingsReal
    total.suggested += suggested
    return {
      month:     m.month,
      real:      m.savingsReal,
      suggested,
      diff:      m.savingsReal - suggested,
      pct:       m.savingsPct,
      planPct:   savingsPlan,
    }
  })

  return { rows, total }
}

// Projected months to reach each active goal at the avg pace of the last 3 months
export function getGoalProjections(goals, config) {
  const last3 = getPeriodMonths(3)

  return goals
    .filter(g => g.status === 'activo')
    .map(goal => {
      const monthlyAvg = last3.reduce((sum, m) => {
        return sum + goal.contributions
          .filter(c => c.date.startsWith(m))
          .reduce((s, c) => s + c.amount, 0)
      }, 0) / 3

      const accumulated = goal.contributions.reduce((s, c) => s + c.amount, 0)
      const remaining   = Math.max(0, goal.targetAmount - accumulated)
      const projectedMonths = monthlyAvg > 0 ? Math.ceil(remaining / monthlyAvg) : null

      const deadlineMonths = goal.deadline
        ? (() => {
            const now    = new Date()
            const target = new Date(goal.deadline)
            return Math.max(0, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()))
          })()
        : null

      const isAtRisk =
        projectedMonths !== null &&
        deadlineMonths  !== null &&
        projectedMonths > deadlineMonths

      return {
        id: goal.id,
        name: goal.name,
        currency: goal.currency,
        priority: goal.priority,
        deadline: goal.deadline,
        accumulated,
        targetAmount: goal.targetAmount,
        monthlyAvg,
        projectedMonths,
        deadlineMonths,
        isAtRisk,
      }
    })
}
