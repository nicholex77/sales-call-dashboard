import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type { CallReport, ChartType, DashboardWidget, MetricKey, RejectionLabel } from '../types'

const DEFAULT_LABELS: RejectionLabel[] = [
  { id: 'budget', name: 'Budget / Too Expensive', color: '#ef4444' },
  { id: 'competitor', name: 'Using a Competitor / Happy with Current', color: '#f97316' },
  { id: 'timing', name: 'Bad Timing / Not Now', color: '#eab308' },
]

export const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'w1', metricKey: 'totalCalls', chartType: 'bar', visible: true, x: 0, y: 0, w: 2, h: 2 },
  { id: 'w2', metricKey: 'totalAnswered', chartType: 'bar', visible: true, x: 2, y: 0, w: 2, h: 2 },
  { id: 'w3', metricKey: 'totalInterested', chartType: 'bar', visible: true, x: 4, y: 0, w: 2, h: 2 },
  { id: 'w4', metricKey: 'totalNotInterested', chartType: 'bar', visible: true, x: 6, y: 0, w: 2, h: 2 },
  { id: 'w5', metricKey: 'suspendTotal', chartType: 'bar', visible: true, x: 8, y: 0, w: 2, h: 2 },
  { id: 'w6', metricKey: 'hangUpTotal', chartType: 'bar', visible: true, x: 10, y: 0, w: 2, h: 2 },
  { id: 'w7', metricKey: 'dailyCallsChart', chartType: 'bar', visible: true, x: 0, y: 2, w: 6, h: 4 },
  { id: 'w8', metricKey: 'dailyInterestChart', chartType: 'bar', visible: true, x: 6, y: 2, w: 6, h: 4 },
  { id: 'w9', metricKey: 'dayByDayTable', chartType: 'bar', visible: true, x: 0, y: 6, w: 12, h: 5 },
  { id: 'w10', metricKey: 'niReasonLog', chartType: 'bar', visible: true, x: 0, y: 11, w: 12, h: 3 },
  { id: 'w11', metricKey: 'answerRate', chartType: 'pie', visible: false, x: 0, y: 14, w: 3, h: 3 },
  { id: 'w12', metricKey: 'interestRate', chartType: 'bar', visible: false, x: 3, y: 14, w: 3, h: 3 },
  { id: 'w13', metricKey: 'notInterestedRate', chartType: 'bar', visible: false, x: 6, y: 14, w: 3, h: 3 },
  { id: 'w14', metricKey: 'noAnswerTotal', chartType: 'bar', visible: false, x: 9, y: 14, w: 3, h: 3 },
  { id: 'w15', metricKey: 'rejectionBreakdown', chartType: 'pie', visible: false, x: 0, y: 17, w: 6, h: 4 },
]

const WIDE_METRIC_KEYS: MetricKey[] = ['dayByDayTable', 'niReasonLog', 'dailyCallsChart', 'dailyInterestChart']

function defaultSize(metricKey: MetricKey): { w: number; h: number } {
  if (metricKey === 'dayByDayTable') return { w: 12, h: 5 }
  if (metricKey === 'niReasonLog') return { w: 12, h: 3 }
  if (metricKey === 'dailyCallsChart' || metricKey === 'dailyInterestChart') return { w: 6, h: 4 }
  if (metricKey === 'rejectionBreakdown') return { w: 4, h: 3 }
  return { w: 3, h: 2 }
}

interface Store {
  reports: CallReport[]
  labels: RejectionLabel[]
  widgets: DashboardWidget[]
  editMode: boolean

  addReport: (data: Omit<CallReport, 'id' | 'createdAt'>) => void
  updateReport: (id: string, data: Partial<CallReport>) => void
  deleteReport: (id: string) => void

  addLabel: (name: string, color: string) => void
  updateLabel: (id: string, name: string, color: string) => void
  deleteLabel: (id: string) => void

  updateWidgets: (widgets: DashboardWidget[]) => void
  toggleWidget: (id: string) => void
  setWidgetChartType: (id: string, chartType: DashboardWidget['chartType']) => void
  addWidget: (metricKey: MetricKey, chartType: ChartType) => void
  removeWidget: (id: string) => void
  resetWidgets: () => void
  toggleEditMode: () => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      reports: [],
      labels: DEFAULT_LABELS,
      widgets: DEFAULT_WIDGETS,
      editMode: false,

      addReport: (data) =>
        set((s) => ({
          reports: [
            ...s.reports,
            { ...data, id: uuid(), createdAt: new Date().toISOString() },
          ],
        })),

      updateReport: (id, data) =>
        set((s) => ({
          reports: s.reports.map((r) => (r.id === id ? { ...r, ...data } : r)),
        })),

      deleteReport: (id) =>
        set((s) => ({ reports: s.reports.filter((r) => r.id !== id) })),

      addLabel: (name, color) =>
        set((s) => ({
          labels: [...s.labels, { id: uuid(), name, color }],
        })),

      updateLabel: (id, name, color) =>
        set((s) => ({
          labels: s.labels.map((l) => (l.id === id ? { ...l, name, color } : l)),
        })),

      deleteLabel: (id) =>
        set((s) => ({ labels: s.labels.filter((l) => l.id !== id) })),

      updateWidgets: (widgets) => set({ widgets }),

      toggleWidget: (id) =>
        set((s) => ({
          widgets: s.widgets.map((w) =>
            w.id === id ? { ...w, visible: !w.visible } : w
          ),
        })),

      setWidgetChartType: (id, chartType) =>
        set((s) => ({
          widgets: s.widgets.map((w) => (w.id === id ? { ...w, chartType } : w)),
        })),

      addWidget: (metricKey, chartType) =>
        set((s) => {
          const maxY = s.widgets.reduce((max, w) => Math.max(max, w.y + w.h), 0)
          const { w, h } = defaultSize(metricKey)
          return {
            widgets: [
              ...s.widgets,
              { id: uuid(), metricKey, chartType, visible: true, x: 0, y: maxY, w, h },
            ],
          }
        }),

      removeWidget: (id) =>
        set((s) => ({ widgets: s.widgets.filter((w) => w.id !== id) })),

      resetWidgets: () => set({ widgets: DEFAULT_WIDGETS }),

      toggleEditMode: () => set((s) => ({ editMode: !s.editMode })),
    }),
    { name: 'sales-call-dashboard' }
  )
)

export { WIDE_METRIC_KEYS }
