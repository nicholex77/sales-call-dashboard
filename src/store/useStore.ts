import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type { CallReport, DashboardWidget, RejectionLabel } from '../types'

const DEFAULT_LABELS: RejectionLabel[] = [
  { id: 'budget', name: 'Budget / Too Expensive', color: '#ef4444' },
  { id: 'competitor', name: 'Using a Competitor / Happy with Current', color: '#f97316' },
  { id: 'timing', name: 'Bad Timing / Not Now', color: '#eab308' },
]

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'w1', metricKey: 'totalCalls', chartType: 'bar', visible: true, x: 0, y: 0, w: 2, h: 2 },
  { id: 'w2', metricKey: 'answerRate', chartType: 'pie', visible: true, x: 2, y: 0, w: 2, h: 2 },
  { id: 'w3', metricKey: 'interestRate', chartType: 'bar', visible: true, x: 4, y: 0, w: 2, h: 2 },
  { id: 'w4', metricKey: 'notInterestedRate', chartType: 'bar', visible: true, x: 6, y: 0, w: 2, h: 2 },
  { id: 'w5', metricKey: 'totalAnswered', chartType: 'bar', visible: true, x: 0, y: 2, w: 2, h: 2 },
  { id: 'w6', metricKey: 'totalInterested', chartType: 'bar', visible: true, x: 2, y: 2, w: 2, h: 2 },
  { id: 'w7', metricKey: 'noAnswerTotal', chartType: 'bar', visible: true, x: 4, y: 2, w: 2, h: 2 },
  { id: 'w8', metricKey: 'rejectionBreakdown', chartType: 'pie', visible: true, x: 0, y: 4, w: 4, h: 3 },
]

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

      toggleEditMode: () => set((s) => ({ editMode: !s.editMode })),
    }),
    { name: 'sales-call-dashboard' }
  )
)
