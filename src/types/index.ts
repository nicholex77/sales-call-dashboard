export interface RejectionLabel {
  id: string
  name: string
  color: string
}

export interface CallReport {
  id: string
  date: string
  agentName: string
  // Outcome counts
  noAnswer: number
  noAnswer2x: number
  noAnswer3x: number
  answered: number
  interested: number
  notInterested: number
  // rejection label id -> count
  rejectionBreakdown: Record<string, number>
  remarks: string
  createdAt: string
}

export type ChartType = 'bar' | 'pie' | 'line' | 'area'

export type MetricKey =
  | 'totalCalls'
  | 'answerRate'
  | 'interestRate'
  | 'notInterestedRate'
  | 'totalAnswered'
  | 'totalInterested'
  | 'totalNotInterested'
  | 'noAnswerTotal'
  | 'rejectionBreakdown'

export interface DashboardWidget {
  id: string
  metricKey: MetricKey
  chartType: ChartType
  visible: boolean
  x: number
  y: number
  w: number
  h: number
}
