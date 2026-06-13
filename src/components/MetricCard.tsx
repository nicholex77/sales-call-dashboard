import type { MetricKey, ChartType } from '../types'
import type { ComputedMetrics } from '../utils/metrics'

interface Props {
  metricKey: MetricKey
  chartType: ChartType
  metrics: ComputedMetrics
  compact?: boolean
}

function getCardConfig(metricKey: MetricKey, metrics: ComputedMetrics) {
  const { totalCalls, totalAnswered, totalInterested, totalNotInterested,
          noAnswerTotal, suspendTotal, hangUpTotal,
          answerRate, interestRate, notInterestedRate, numDays } = metrics

  switch (metricKey) {
    case 'totalCalls':
      return {
        label: 'TOTAL CALLS',
        value: totalCalls,
        sub: `${numDays} day${numDays !== 1 ? 's' : ''} tracked`,
        color: 'text-white',
      }
    case 'totalAnswered':
      return {
        label: 'ANSWERED',
        value: totalAnswered,
        sub: `${answerRate.toFixed(1)}% answer rate`,
        color: 'text-white',
      }
    case 'totalInterested':
      return {
        label: 'INTERESTED',
        value: totalInterested,
        sub: `${interestRate.toFixed(1)}% of answered`,
        color: 'text-emerald-400',
      }
    case 'totalNotInterested':
      return {
        label: 'NOT INTERESTED',
        value: totalNotInterested,
        sub: `${notInterestedRate.toFixed(1)}% of answered`,
        color: 'text-white',
      }
    case 'suspendTotal':
      return {
        label: 'SUSPEND',
        value: suspendTotal,
        sub: totalAnswered > 0 ? `${((suspendTotal / totalAnswered) * 100).toFixed(1)}% of answered` : '—',
        color: 'text-white',
      }
    case 'hangUpTotal':
      return {
        label: 'HANG UP',
        value: hangUpTotal,
        sub: totalAnswered > 0 ? `${((hangUpTotal / totalAnswered) * 100).toFixed(1)}% of answered` : '—',
        color: 'text-white',
      }
    case 'noAnswerTotal':
      return {
        label: 'NO ANSWER',
        value: noAnswerTotal,
        sub: totalCalls > 0 ? `${(((totalCalls - totalAnswered) / totalCalls) * 100).toFixed(1)}% of total` : '—',
        color: 'text-white',
      }
    case 'answerRate':
      return {
        label: 'ANSWER RATE',
        value: `${answerRate.toFixed(1)}%`,
        sub: `${totalAnswered} of ${totalCalls} calls`,
        color: answerRate >= 30 ? 'text-emerald-400' : answerRate >= 15 ? 'text-amber-400' : 'text-red-400',
      }
    case 'interestRate':
      return {
        label: 'INTEREST RATE',
        value: `${interestRate.toFixed(1)}%`,
        sub: `${totalInterested} of ${totalAnswered} answered`,
        color: interestRate >= 50 ? 'text-emerald-400' : interestRate >= 30 ? 'text-amber-400' : 'text-red-400',
      }
    case 'notInterestedRate':
      return {
        label: 'NI RATE',
        value: `${notInterestedRate.toFixed(1)}%`,
        sub: `${totalNotInterested} of ${totalAnswered} answered`,
        color: 'text-red-400',
      }
    default:
      return { label: metricKey, value: '—', sub: '', color: 'text-white' }
  }
}

export default function MetricCard({ metricKey, metrics }: Props) {
  const { label, value, sub, color } = getCardConfig(metricKey, metrics)

  return (
    <div className="h-full flex flex-col justify-between">
      <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-1">
        {label}
      </p>
      <p className={`text-3xl font-bold leading-none ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}
