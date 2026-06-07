const CHART_H    = 140
const BAR_W      = 14
const BAR_GAP    = 3
const GROUP_W    = 3 * BAR_W + 2 * BAR_GAP  // 48px
const GROUP_GAP  = 14
const GROUP_STEP = GROUP_W + GROUP_GAP       // 62px
const TOP_PAD    = 18   // room for % label on top of bar
const BOT_PAD    = 22   // room for month label
const SVG_H      = TOP_PAD + CHART_H + BOT_PAD

const MONTH_ABBR = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
function shortMonth(m) { return MONTH_ABBR[parseInt(m.split('-')[1], 10) - 1] }

const BLOCK_ORDER = ['needs', 'wants', 'savings']
const COLORS = {
  needs:   { ok: '#3b82f6', over: '#f59e0b' },
  wants:   { ok: '#8b5cf6', over: '#f59e0b' },
  savings: { ok: '#10b981', over: '#f87171' },
}

function pctY(pct) {
  return TOP_PAD + CHART_H - Math.min(100, Math.max(0, pct)) / 100 * CHART_H
}

export default function BlockChart({ monthData, config }) {
  if (!monthData.length) return null

  const plans = {
    needs:   config.needsPercent   ?? 50,
    wants:   config.wantsPercent   ?? 30,
    savings: config.savingsPercent ?? 20,
  }

  const getPct = (m, block) =>
    block === 'needs' ? m.needsPct : block === 'wants' ? m.wantsPct : m.savingsPct

  const isOffTrack = (block, pct) =>
    block === 'savings' ? pct < plans[block] : pct > plans[block]

  const totalW  = monthData.length * GROUP_STEP - GROUP_GAP
  const minContainerW = '100%'

  return (
    <div className="overflow-x-auto -mx-1">
      <div style={{ minWidth: minContainerW }}>
        <svg
          width={Math.max(totalW, 200)}
          height={SVG_H}
          style={{ display: 'block' }}
        >
          {/* Horizontal guide lines */}
          {[25, 50, 75, 100].map(pct => (
            <g key={pct}>
              <line
                x1={0} x2={Math.max(totalW, 200)}
                y1={pctY(pct)} y2={pctY(pct)}
                stroke="#e2e8f0" strokeWidth={1}
                strokeDasharray={pct === 50 ? '4,3' : '2,4'}
              />
              <text
                x={Math.max(totalW, 200) - 2}
                y={pctY(pct) - 2}
                textAnchor="end"
                fontSize={7}
                fill="#cbd5e1"
              >
                {pct}%
              </text>
            </g>
          ))}

          {/* Bars */}
          {monthData.map((m, gi) => {
            const groupX = gi * GROUP_STEP
            return (
              <g key={m.month}>
                {BLOCK_ORDER.map((block, bi) => {
                  const pct    = getPct(m, block)
                  const off    = isOffTrack(block, pct)
                  const color  = off ? COLORS[block].over : COLORS[block].ok
                  const barH   = Math.max(0, (Math.min(100, pct) / 100) * CHART_H)
                  const barX   = groupX + bi * (BAR_W + BAR_GAP)
                  const barY   = TOP_PAD + CHART_H - barH
                  const planY  = pctY(plans[block])

                  return (
                    <g key={block}>
                      {/* Bar */}
                      <rect
                        x={barX} y={barY}
                        width={BAR_W} height={barH}
                        rx={3}
                        fill={color}
                        opacity={0.85}
                      />
                      {/* Plan marker */}
                      <line
                        x1={barX} x2={barX + BAR_W}
                        y1={planY} y2={planY}
                        stroke={COLORS[block].ok}
                        strokeWidth={2}
                        strokeDasharray="3,2"
                        opacity={0.9}
                      />
                      {/* % label */}
                      {pct >= 3 && (
                        <text
                          x={barX + BAR_W / 2}
                          y={Math.max(TOP_PAD - 1, barY - 2)}
                          textAnchor="middle"
                          fontSize={7.5}
                          fontWeight="700"
                          fill={color}
                        >
                          {Math.round(pct)}
                        </text>
                      )}
                    </g>
                  )
                })}
                {/* Month label */}
                <text
                  x={groupX + GROUP_W / 2}
                  y={TOP_PAD + CHART_H + 14}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#94a3b8"
                >
                  {shortMonth(m.month)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-2 px-1">
        {[
          { block: 'needs',   label: `Nec. (${plans.needs}%)`,    color: COLORS.needs.ok   },
          { block: 'wants',   label: `Des. (${plans.wants}%)`,    color: COLORS.wants.ok   },
          { block: 'savings', label: `Aho. (${plans.savings}%)`,  color: COLORS.savings.ok },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-slate-500">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 ml-auto">
          <svg width={14} height={8}>
            <line x1={0} x2={14} y1={4} y2={4} stroke="#64748b" strokeWidth={1.5} strokeDasharray="3,2" />
          </svg>
          <span className="text-[10px] text-slate-400">plan</span>
        </div>
      </div>
    </div>
  )
}
