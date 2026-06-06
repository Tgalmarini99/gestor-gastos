export function toBaseCurrency(amount, fromCurrency, config) {
  if (fromCurrency === config.baseCurrency) return amount
  return config.baseCurrency === 'ARS'
    ? amount * config.exchangeRate
    : amount / config.exchangeRate
}

export function getBlockBudgets(totalIncome) {
  return {
    needs: totalIncome * 0.5,
    wants: totalIncome * 0.3,
    savings: totalIncome * 0.2,
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
export function getCurrentBalance(deposits, expenses) {
  const sum = (arr, currency) =>
    arr.filter(x => x.currency === currency).reduce((s, x) => s + x.amount, 0)

  const arsIn  = sum(deposits, 'ARS')
  const usdIn  = sum(deposits, 'USD')
  const arsOut = sum(expenses, 'ARS')
  const usdOut = sum(expenses, 'USD')

  return { arsBalance: arsIn - arsOut, usdBalance: usdIn - usdOut, arsIn, usdIn, arsOut, usdOut }
}

// Totales del mes por moneda — para el desglose mensual
export function getMonthlyBalance(deposits, expenses, month) {
  const monthDeps = deposits.filter(d => d.date.startsWith(month))
  const monthExps = expenses.filter(e => e.date.startsWith(month))
  const sum = (arr, currency) =>
    arr.filter(x => x.currency === currency).reduce((s, x) => s + x.amount, 0)

  return {
    arsIn:  sum(monthDeps, 'ARS'),
    usdIn:  sum(monthDeps, 'USD'),
    arsOut: sum(monthExps, 'ARS'),
    usdOut: sum(monthExps, 'USD'),
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

export function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function filterExpensesByMonth(expenses, month) {
  return expenses.filter(e => e.date.startsWith(month))
}
