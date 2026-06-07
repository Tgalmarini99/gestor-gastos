export async function fetchBnaRate() {
  try {
    const res = await fetch('https://api.bluelytics.com.ar/v2/latest')
    if (!res.ok) throw new Error()
    const data = await res.json()
    return (data.oficial.value_buy + data.oficial.value_sell) / 2
  } catch {
    try {
      const res = await fetch('https://api.argentinadatos.com/v1/cotizaciones/dolares/oficial')
      if (!res.ok) throw new Error()
      const arr = await res.json()
      const last = arr[arr.length - 1]
      return (last.compra + last.venta) / 2
    } catch {
      return null
    }
  }
}
