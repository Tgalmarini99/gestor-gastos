export function toBaseCurrency(amount, fromCurrency, config) {
  if (fromCurrency === config.baseCurrency) return amount
  return config.baseCurrency === 'ARS'
    ? amount * config.bnaRate
    : amount / config.bnaRate
}

// Ingreso mensual fijo en ARS, calculado desde config
// Total ARS = monthlyIncomeUSD × bnaRate (parte USD convertida + parte ARS directa)
export function getFixedMonthlyIncomeARS(config) {
  const { monthlyIncomeUSD = 0, bnaRate = 1200 } = config
  return monthlyIncomeUSD * bnaRate
}

export function getBlockBudgets(totalIncome, config = {}) {
  return {
    needs:   totalIncome * ((config.needsPercent   ?? 50) / 100),
    wants:   totalIncome * ((config.wantsPercent   ?? 30) / 100),
    savings: totalIncome * ((config.savingsPercent ?? 20) / 100),
  }
}

export function getBlockTotals(expenses, config, categoryBlockMap) {
  const totals = { needs: 0, wants: 0 }
  for (const exp of expenses) {
    const block = categoryBlockMap[exp.category]
    if (block) {
      totals[block] = (totals[block] || 0) + toBaseCurrency(exp.amount, exp.currency, config)
    }
  }
  return totals
}

export function getCategoryTotals(expenses, config) {
  const totals = {}
  for (const exp of expenses) {
    const amount = toBaseCurrency(exp.amount, exp.currency, config)
    totals[exp.category] = (totals[exp.category] || 0) + amount
  }
  return totals
}

// Balance por moneda — sin conversión
// Los aportes a objetivos reducen el balance disponible (el dinero está "reservado")
export function getCurrentBalance(deposits, expenses, goals = []) {
  const sum = (arr, currency) =>
    arr.filter(x => x.currency === currency).reduce((s, x) => s + x.amount, 0)

  const arsIn  = sum(deposits, 'ARS')
  const usdIn  = sum(deposits, 'USD')
  const arsOut = sum(expenses, 'ARS')
  const usdOut = sum(expenses, 'USD')

  const arsInGoals = goals.reduce((s, g) =>
    s + g.contributions
      .filter(c => (c.currency ?? g.currency) === 'ARS')
      .reduce((a, c) => a + c.amount, 0)
  , 0)
  const usdInGoals = goals.reduce((s, g) =>
    s + g.contributions
      .filter(c => (c.currency ?? g.currency) === 'USD')
      .reduce((a, c) => a + c.amount, 0)
  , 0)

  return {
    arsBalance: arsIn - arsOut - arsInGoals,
    usdBalance: usdIn - usdOut - usdInGoals,
    arsIn, usdIn, arsOut, usdOut,
    arsInGoals, usdInGoals,
  }
}

// Totales del mes por moneda — para el desglose mensual
export function getMonthlyBalance(deposits, expenses, month, goals = []) {
  const monthDeps = deposits.filter(d => d.date.startsWith(month))
  const monthExps = expenses.filter(e => e.date.startsWith(month))
  const sum = (arr, currency) =>
    arr.filter(x => x.currency === currency).reduce((s, x) => s + x.amount, 0)

  const arsContrib = goals.reduce((s, g) =>
    s + g.contributions
      .filter(c => c.date.startsWith(month) && (c.currency ?? g.currency) === 'ARS')
      .reduce((a, c) => a + c.amount, 0)
  , 0)
  const usdContrib = goals.reduce((s, g) =>
    s + g.contributions
      .filter(c => c.date.startsWith(month) && (c.currency ?? g.currency) === 'USD')
      .reduce((a, c) => a + c.amount, 0)
  , 0)

  return {
    arsIn:  sum(monthDeps, 'ARS'),
    usdIn:  sum(monthDeps, 'USD'),
    arsOut: sum(monthExps, 'ARS'),
    usdOut: sum(monthExps, 'USD'),
    arsContrib,
    usdContrib,
  }
}

// Total ingresado en un mes dado en moneda base — para el 50/30/20
export function getMonthlyDepositsTotal(deposits, month, config) {
  return deposits
    .filter(d => d.date.startsWith(month))
    .reduce((sum, d) => sum + toBaseCurrency(d.amount, d.currency, config), 0)
}

export function getSavingsTotalByMonth(goals, month, config) {
  return goals.reduce((total, goal) => {
    const monthContributions = goal.contributions
      .filter(c => c.date.startsWith(month))
      .reduce((sum, c) => sum + toBaseCurrency(c.amount, goal.currency, config), 0)
    return total + monthContributions
  }, 0)
}

export function getGoalProgress(goal) {
  const accumulated = goal.contributions.reduce((sum, c) => sum + c.amount, 0)
  const percentage = goal.targetAmount > 0 ? (accumulated / goal.targetAmount) * 100 : 0
  const remaining = Math.max(0, goal.targetAmount - accumulated)
  return { accumulated, percentage, remaining }
}

export function getMonthsUntilDeadline(deadline) {
  const now = new Date()
  const target = new Date(deadline)
  const months =
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth())
  return Math.max(0, months)
}

export function getSuggestedMonthlyContribution(goal) {
  const { remaining } = getGoalProgress(goal)
  const months = getMonthsUntilDeadline(goal.deadline)
  return months > 0 ? remaining / months : remaining
}

const PRIORITY_WEIGHTS = { alta: 50, media: 20, baja: 10 }

// Distribución automática del 20% de ahorro entre objetivos activos
export function getGoalDistribution(monthlyIncomeARS, goals, config) {
  const savingsBlock = monthlyIncomeARS * ((config.savingsPercent ?? 20) / 100)
  const emergencyReserve = monthlyIncomeARS * ((config.emergencyReservePercent ?? 10) / 100)
  const goalsFund = Math.max(0, savingsBlock - emergencyReserve)
  const tc = config.bnaRate || 1200

  const activeGoals = goals.filter(g => g.status === 'activo')
  const totalWeight = activeGoals.reduce((s, g) => s + (PRIORITY_WEIGHTS[g.priority] || 10), 0)

  const suggestions = {}
  for (const g of activeGoals) {
    const weight = PRIORITY_WEIGHTS[g.priority] || 10
    const suggestedARS = totalWeight > 0 ? (weight / totalWeight) * goalsFund : 0
    const suggestedMonthly = g.currency === 'ARS' ? suggestedARS : suggestedARS / tc

    const { accumulated, remaining, percentage } = getGoalProgress(g)
    const monthsToComplete = suggestedMonthly > 0 ? Math.ceil(remaining / suggestedMonthly) : null
    const deadlineMonths = g.deadline ? getMonthsUntilDeadline(g.deadline) : null

    const onTrack = monthsToComplete !== null && deadlineMonths !== null && monthsToComplete <= deadlineMonths
    const extraNeededMonthly =
      !onTrack && deadlineMonths != null && deadlineMonths > 0
        ? Math.max(0, remaining / deadlineMonths - suggestedMonthly)
        : null

    suggestions[g.id] = {
      suggestedMonthly,
      accumulated,
      remaining,
      percentage,
      monthsToComplete,
      deadlineMonths,
      isOnTrack: onTrack,
      extraNeededMonthly,
    }
  }

  return { savingsBlock, emergencyReserve, goalsFund, suggestions }
}

export function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function filterExpensesByMonth(expenses, month) {
  return expenses.filter(e => e.date.startsWith(month))
}
