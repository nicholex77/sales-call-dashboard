import type { MetricKey, ChartType } from '../types'
import type { ComputedMetrics } from '../utils/metrics'
import { METRIC_LABELS, formatMetricValue } from '../utils/metrics'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const COLORS = ['#6366f1', '#22c55e', '#f97316', '#ef4444', '#06b6d4', '#a855f7', '#ec4899', '#eab308']

type ScalarMetricKey = Exclude<MetricKey, 'dailyCallsChart' | 'dailyInterestChart' | 'dayByDayTable' | 'niReasonLog'>

interface Props {
  metricKey: ScalarMetricKey
  chartType: ChartType
  metrics: ComputedMetrics
  compact?: boolean
}

function getSubtitle(metricKey: ScalarMetricKey, metrics: ComputedMetrics): string {
  switch (metricKey) {
    case 'totalCalls':
      return metrics.numDays > 0 ? `${metrics.numDays} day${metrics.numDays !== 1 ? 's' : ''} tracked` : ''
    case 'totalAnswered':
      return `${metrics.answerRate.toFixed(1)}% answer rate`
    case 'totalInterested':
      return `${metrics.interestRate.toFixed(1)}% of answered`
    case 'totalNotInterested':
      return `${metrics.notInterestedRate.toFixed(1)}% of answered`
    case 'suspendTotal':
      return metrics.totalAnswered > 0
        ? `${((metrics.suspendTotal / metrics.totalAnswered) * 100).toFixed(1)}% of answered`
        : ''
    case 'hangUpTotal':
      return metrics.totalAnswered > 0
        ? `${((metrics.hangUpTotal / metrics.totalAnswered) * 100).toFixed(1)}% of answered`
        : ''
    case 'noAnswerTotal':
      return metrics.totalCalls > 0
        ? `${((metrics.noAnswerTotal / metrics.totalCalls) * 100).toFixed(1)}% of total`
        : ''
    case 'answerRate':
      return `${metrics.totalAnswered} answered`
    case 'interestRate':
      return `${metrics.totalInterested} interested`
    case 'notInterestedRate':
      return `${metrics.totalNotInterested} not interested`
    default:
      return ''
  }
}

export default function MetricCard({ metricKey, chartType, metrics, compact }: Props) {
  const label = METRIC_LABELS[metricKey]

  if (metricKey === 'rejectionBreakdown') {
    return <RejectionChart data={metrics.rejectionBreakdown} chartType={chartType} compact={compact} />
  }

  const rawValue = metrics[metricKey as keyof ComputedMetrics]
  if (typeof rawValue !== 'number') return null

  const formatted = formatMetricValue(metricKey, rawValue)
  const isRate = metricKey.endsWith('Rate')
  const subtitle = getSubtitle(metricKey, metrics)

  if (compact) {
    return (
      <div className="h-full flex flex-col justify-center gap-0.5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-none">{label}</p>
        <p className={`font-bold text-slate-800 leading-none ${isRate ? 'text-xl' : 'text-2xl'}`}>{formatted}</p>
        {subtitle && <p className="text-xs text-slate-400 leading-none">{subtitle}</p>}
      </div>
    )
  }

  const chartData = [
    { name: label, value: rawValue },
    ...(isRate ? [{ name: 'Remaining', value: 100 - rawValue }] : []),
  ]

  return (
    <div className="h-full flex flex-col">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mb-1">{formatted}</p>
      {subtitle && <p className="text-xs text-slate-400 mb-2">{subtitle}</p>}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' || isRate ? (
            <PieChart>
              <Pie data={chartData} dataKey="value" cx="50%" cy="50%" outerRadius="80%">
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? COLORS[0] : '#e2e8f0'} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${Number(v).toFixed(1)}${isRate ? '%' : ''}`} />
            </PieChart>
          ) : chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={COLORS[0]} strokeWidth={2} dot />
            </LineChart>
          ) : chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke={COLORS[0]} fill={COLORS[0] + '40'} />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function RejectionChart({
  data,
  chartType,
  compact,
}: {
  data: { label: string; count: number; color: string }[]
  chartType: ChartType
  compact?: boolean
}) {
  const chartData = data.map((d) => ({ name: d.label, value: d.count, color: d.color }))

  if (data.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Rejection Reasons</p>
        <p className="text-sm text-slate-400 mt-4 text-center">No rejection data yet</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Rejection Reasons</p>
      {compact ? (
        <div className="space-y-1 mt-1 overflow-auto">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
              <span className="text-slate-600 flex-1 truncate">{d.label}</span>
              <span className="font-medium">{d.count}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%" label>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.color ?? COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke={COLORS[0]} strokeWidth={2} dot />
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke={COLORS[0]} fill={COLORS[0] + '40'} />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.color ?? COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
