import { formatCompact, formatMonthLabel } from '../../utils/formatters'

function sign(n) { return n >= 0 ? '+' : '' }

export default function SavingsRate({ data }) {
  if (!data?.rows?.length) return null
  const { rows, total } = data

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[320px]">
          <thead>
            <tr className="text-[10px] text-slate-400 uppercase tracking-wide">
              <th className="text-left pb-2 font-semibold">Mes</th>
              <th className="text-right pb-2 font-semibold">Real</th>
              <th className="text-right pb-2 font-semibold">Plan</th>
              <th className="text-right pb-2 font-semibold">Dif.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map(r => (
              <tr key={r.month}>
                <td className="py-2 text-slate-600 text-xs">
                  {formatMonthLabel(r.month).split(' ')[0].slice(0, 3)}{' '}
                  <span className="text-slate-400">{r.month.split('-')[0]}</span>
                </td>
                <td className="py-2 text-right font-semibold text-slate-800">
                  {formatCompact(r.real, 'ARS')}
                </td>
                <td className="py-2 text-right text-slate-400">
                  {formatCompact(r.suggested, 'ARS')}
                </td>
                <td className={`py-2 text-right font-bold ${r.diff >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {sign(r.diff)}{formatCompact(Math.abs(r.diff), 'ARS')}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-slate-200">
            <tr>
              <td className="pt-2 text-xs font-bold text-slate-600">Acumulado</td>
              <td className="pt-2 text-right font-bold text-slate-800">
                {formatCompact(total.real, 'ARS')}
              </td>
              <td className="pt-2 text-right text-slate-400">
                {formatCompact(total.suggested, 'ARS')}
              </td>
              <td className={`pt-2 text-right font-bold ${total.real >= total.suggested ? 'text-emerald-600' : 'text-red-500'}`}>
                {sign(total.real - total.suggested)}{formatCompact(Math.abs(total.real - total.suggested), 'ARS')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
