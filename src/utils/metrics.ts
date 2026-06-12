import type { CallReport, RejectionLabel } from '../types'

export interface ComputedMetrics {
  totalCalls: number
  totalAnswered: number
  totalInterested: number
  totalNotInterested: number
  noAnswerTotal: number
  answerRate: number
  interestRate: number
  notInterestedRate: number
  rejectionBreakdown: { label: string; count: number; color: string }[]
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
  const totalCalls = totalAnswered + noAnswerTotal

  const answerRate = totalCalls > 0 ? (totalAnswered / totalCalls) * 100 : 0
  const interestRate =
    totalAnswered > 0 ? (totalInterested / totalAnswered) * 100 : 0
  const notInterestedRate =
    totalAnswered > 0 ? (totalNotInterested / totalAnswered) * 100 : 0

  // Aggregate rejection breakdown across all reports
  const rejectionTotals: Record<string, number> = {}
  for (const report of reports) {
    for (const [labelId, count] of Object.entries(report.rejectionBreakdown)) {
      rejectionTotals[labelId] = (rejectionTotals[labelId] ?? 0) + count
    }
  }

  const rejectionBreakdown = labels
    .map((l) => ({ label: l.name, count: rejectionTotals[l.id] ?? 0, color: l.color }))
    .filter((r) => r.count > 0)

  return {
    totalCalls,
    totalAnswered,
    totalInterested,
    totalNotInterested,
    noAnswerTotal,
    answerRate,
    interestRate,
    notInterestedRate,
    rejectionBreakdown,
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
  rejectionBreakdown: 'Rejection Reasons',
}

export function formatMetricValue(key: string, value: number): string {
  if (key.endsWith('Rate')) return `${value.toFixed(1)}%`
  return value.toString()
}
