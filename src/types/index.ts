export interface RejectionLabel {
  id: string
  name: string
  color: string
}

export interface CallReport {
  id: string
  date: string
  agentName: string
  noAnswer: number
  noAnswer2x: number
  noAnswer3x: number
  answered: number
  interested: number
  notInterested: number
  suspend: number
  hangUp: number
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
  | 'suspendTotal'
  | 'hangUpTotal'
  | 'rejectionBreakdown'
  | 'dailyCallsChart'
  | 'dailyInterestChart'
  | 'dayByDayTable'
  | 'niReasonLog'

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
