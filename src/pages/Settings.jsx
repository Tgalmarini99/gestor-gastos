import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Download, RefreshCw, DollarSign, Shield } from 'lucide-react'
import useStore from '../store/useStore'
import Card from '../components/ui/Card'

export default function Settings() {
  const { config, updateConfig, exportData, fetchAndUpdateBnaRate } = useStore()
  const [refreshing, setRefreshing] = useState(false)
  const [bnaInput, setBnaInput] = useState(String(config.bnaRate ?? 1200))

  useEffect(() => {
    setBnaInput(String(config.bnaRate ?? 1200))
  }, [config.bnaRate])

  const arsPercent = config.arsPercent ?? 80
  const usdPercent = 100 - arsPercent
  const totalUSD = config.monthlyIncomeUSD ?? 0
  const bnaRate = config.bnaRate ?? 1200

  const usdPart = Math.round(totalUSD * usdPercent / 100 * 100) / 100
  const arsPart = Math.round(totalUSD * arsPercent / 100 * bnaRate)

  const handleRefreshBna = async () => {
    setRefreshing(true)
    await fetchAndUpdateBnaRate(true)
    setRefreshing(false)
  }

  const handleBnaManual = (val) => {
    setBnaInput(val)
    const n = Number(val)
    if (n > 0) updateConfig({ bnaRate: n })
  }

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gestor-gastos-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const bnaDateLabel = config.bnaRateDate
    ? new Date(config.bnaRateDate + 'T12:00:00').toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      })
    : null

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Configuración</h1>
      <p className="text-slate-400 text-sm mb-6">Ingreso fijo y tipo de cambio</p>

      <div className="space-y-4">

        {/* Ingreso mensual fijo */}
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-slate-400" />
            Ingreso mensual fijo
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Monto bruto total en USD
              </label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
                <span className="text-slate-400 text-sm font-medium">U$S</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={config.monthlyIncomeUSD || ''}
                  onChange={e => updateConfig({ monthlyIncomeUSD: Number(e.target.value) || 0 })}
                  placeholder="0"
                  className="flex-1 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">
                Porción en ARS: <strong className="text-slate-700">{arsPercent}%</strong>
                <span className="text-slate-300 mx-1">·</span>
                USD: <strong className="text-slate-700">{usdPercent}%</strong>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={arsPercent}
                onChange={e => updateConfig({ arsPercent: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                <span>0% ARS</span>
                <span>100% ARS</span>
              </div>
            </div>

            {totalUSD > 0 && (
              <div className="bg-indigo-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-2">
                  Desglose mensual
                </p>
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-xs text-indigo-400 mb-0.5">En dólares</p>
                    <p className="font-bold text-indigo-700">
                      U$S {usdPart.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-400 mb-0.5">En pesos</p>
                    <p className="font-bold text-indigo-700">$ {arsPart.toLocaleString('es-AR')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Cotización BNA */}
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <RefreshCw size={16} className="text-slate-400" />
            Cotización BNA (oficial)
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  $ {Number(bnaInput || bnaRate).toLocaleString('es-AR')}
                </p>
                {bnaDateLabel ? (
                  <p className="text-xs text-slate-400 mt-0.5">Actualizado {bnaDateLabel}</p>
                ) : (
                  <p className="text-xs text-slate-400 mt-0.5">Sin actualización automática</p>
                )}
              </div>
              <button
                onClick={handleRefreshBna}
                disabled={refreshing}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition-colors ${
                  refreshing
                    ? 'bg-slate-100 text-slate-400'
                    : 'bg-indigo-50 text-indigo-600 active:bg-indigo-100'
                }`}
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                Actualizar
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Ajuste manual
              </label>
              <input
                type="number"
                value={bnaInput}
                onChange={e => handleBnaManual(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </Card>

        {/* Reserva de emergencia */}
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Shield size={16} className="text-slate-400" />
            Reserva de emergencia
          </h2>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              % del ingreso mensual destinado a emergencias
            </label>
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                max="20"
                value={config.emergencyReservePercent ?? 10}
                onChange={e => updateConfig({ emergencyReservePercent: Number(e.target.value) })}
                className="flex-1 text-sm outline-none"
              />
              <span className="text-slate-400 text-sm">%</span>
            </div>
          </div>
        </Card>

        {/* Export */}
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Download size={16} className="text-slate-400" />
            Exportar datos
          </h2>
          <p className="text-xs text-slate-400 mb-3">
            Descargá un backup de todos tus datos en formato JSON.
          </p>
          <button
            onClick={handleExport}
            className="w-full bg-slate-100 text-slate-700 font-medium text-sm py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Descargar backup
          </button>
        </Card>

      </div>
    </div>
  )
}
