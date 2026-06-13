import type { CallReport, RejectionLabel } from '../types'

export interface DailyBreakdown {
  date: string
  total: number
  answered: number
  noAnswer: number
  noAnswer2x: number
  interested: number
  notInterested: number
  suspend: number
  hangUp: number
  answerRate: number
  interestRate: number
}

export interface ComputedMetrics {
  totalCalls: number
  totalAnswered: number
  totalInterested: number
  totalNotInterested: number
  noAnswerTotal: number
  suspendTotal: number
  hangUpTotal: number
  answerRate: number
  interestRate: number
  notInterestedRate: number
  numDays: number
  rejectionBreakdown: { label: string; count: number; color: string }[]
  dailyBreakdown: DailyBreakdown[]
}

export function computeMetrics(
  reports: CallReport[],
  labels: RejectionLabel[]
): ComputedMetrics {
  const totalAnswered = reports.reduce((s, r) => s + r.answered, 0)
  const totalInterested = reports.reduce((s, r) => s + r.interested, 0)
  const totalNotInterested = reports.reduce((s, r) => s + r.notInterested, 0)
  const noAnswerTotal = reports.reduce(
    (s, r) => s + r.noAnswer + r.noAnswer2x + r.noAnswer3x,
    0
  )
  const suspendTotal = reports.reduce((s, r) => s + (r.suspend ?? 0), 0)
  const hangUpTotal = reports.reduce((s, r) => s + (r.hangUp ?? 0), 0)
  const totalCalls = totalAnswered + noAnswerTotal

  const answerRate = totalCalls > 0 ? (totalAnswered / totalCalls) * 100 : 0
  const interestRate = totalAnswered > 0 ? (totalInterested / totalAnswered) * 100 : 0
  const notInterestedRate =
    totalAnswered > 0 ? (totalNotInterested / totalAnswered) * 100 : 0

  const rejectionTotals: Record<string, number> = {}
  for (const report of reports) {
    for (const [labelId, count] of Object.entries(report.rejectionBreakdown)) {
      rejectionTotals[labelId] = (rejectionTotals[labelId] ?? 0) + count
    }
  }
  const rejectionBreakdown = labels
    .map((l) => ({ label: l.name, count: rejectionTotals[l.id] ?? 0, color: l.color }))
    .filter((r) => r.count > 0)

  const byDate = new Map<string, CallReport[]>()
  for (const report of reports) {
    const existing = byDate.get(report.date) ?? []
    byDate.set(report.date, [...existing, report])
  }

  const dailyBreakdown: DailyBreakdown[] = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayReports]) => {
      const answered = dayReports.reduce((s, r) => s + r.answered, 0)
      const noAnswer = dayReports.reduce((s, r) => s + r.noAnswer, 0)
      const noAnswer2x = dayReports.reduce((s, r) => s + r.noAnswer2x, 0)
      const noAnswer3x = dayReports.reduce((s, r) => s + r.noAnswer3x, 0)
      const interested = dayReports.reduce((s, r) => s + r.interested, 0)
      const notInterested = dayReports.reduce((s, r) => s + r.notInterested, 0)
      const suspend = dayReports.reduce((s, r) => s + (r.suspend ?? 0), 0)
      const hangUp = dayReports.reduce((s, r) => s + (r.hangUp ?? 0), 0)
      const total = answered + noAnswer + noAnswer2x + noAnswer3x
      return {
        date,
        total,
        answered,
        noAnswer,
        noAnswer2x,
        interested,
        notInterested,
        suspend,
        hangUp,
        answerRate: total > 0 ? (answered / total) * 100 : 0,
        interestRate: answered > 0 ? (interested / answered) * 100 : 0,
      }
    })

  return {
    totalCalls,
    totalAnswered,
    totalInterested,
    totalNotInterested,
    noAnswerTotal,
    suspendTotal,
    hangUpTotal,
    answerRate,
    interestRate,
    notInterestedRate,
    numDays: dailyBreakdown.length,
    rejectionBreakdown,
    dailyBreakdown,
  }
}

export const METRIC_LABELS: Record<string, string> = {
  totalCalls: 'Total Calls',
  answerRate: 'Answer Rate',
  interestRate: 'Interest Rate',
  notInterestedRate: 'Not Interested Rate',
  totalAnswered: 'Total Answered',
  totalInterested: 'Total Interested',
  totalNotInterested: 'Total Not Interested',
  noAnswerTotal: 'No Answer Total',
  suspendTotal: 'Suspend',
  hangUpTotal: 'Hang Up',
  rejectionBreakdown: 'Rejection Reasons',
  dailyCallsChart: 'Daily Calls Chart',
  dailyInterestChart: 'Daily Interest Chart',
  dayByDayTable: 'Day-by-Day Table',
  niReasonLog: 'NI Reason Log',
}

export function formatMetricValue(key: string, value: number): string {
  if (key.endsWith('Rate')) return `${value.toFixed(1)}%`
  return value.toString()
}
