import { Settings as SettingsIcon, Download } from 'lucide-react'
import useStore from '../store/useStore'
import Card from '../components/ui/Card'

export default function Settings() {
  const { config, updateConfig, exportData } = useStore()

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

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Configuración</h1>
      <p className="text-slate-400 text-sm mb-6">Tipo de cambio e ingresos</p>

      <div className="space-y-4">
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <SettingsIcon size={16} className="text-slate-400" />
            Configuración general
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Tipo de cambio (ARS / USD)
              </label>
              <input
                type="number"
                value={config.exchangeRate}
                onChange={e => updateConfig({ exchangeRate: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Moneda base
              </label>
              <div className="flex gap-2">
                {['ARS', 'USD'].map(currency => (
                  <button
                    key={currency}
                    onClick={() => updateConfig({ baseCurrency: currency })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      config.baseCurrency === currency
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {currency}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

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
