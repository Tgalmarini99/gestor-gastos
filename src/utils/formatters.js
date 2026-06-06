const esAR = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatCurrency(amount, currency = 'ARS') {
  const n = Math.round(amount)
  return currency === 'ARS'
    ? `$ ${esAR.format(n)}`
    : `USD ${esAR.format(n)}`
}

export function formatCompact(amount, currency = 'ARS') {
  let value = amount
  let suffix = ''
  if (amount >= 1_000_000) { value = amount / 1_000_000; suffix = 'M' }
  else if (amount >= 1_000) { value = amount / 1_000; suffix = 'k' }

  const fmt = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
  })

  return currency === 'ARS'
    ? `$ ${fmt.format(value)}${suffix}`
    : `USD ${fmt.format(value)}${suffix}`
}

export function formatPercent(value) {
  return `${Math.round(value)}%`
}

export function formatMonthLabel(monthStr) {
  const [year, month] = monthStr.split('-')
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]
  return `${months[parseInt(month, 10) - 1]} ${year}`
}

export function formatShortDate(dateStr) {
  const [, month, day] = dateStr.split('-')
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]}`
}
