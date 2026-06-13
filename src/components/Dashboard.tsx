import { useMemo, useCallback, useState } from 'react'
import { GridLayout } from 'react-grid-layout'
import type { Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '../store/useStore'
import { computeMetrics, METRIC_LABELS } from '../utils/metrics'
import MetricCard from './MetricCard'
import {
  DailyCallsWidget,
  DailyInterestWidget,
  DayByDayTableWidget,
  NiReasonLogWidget,
} from './DashboardWidgets'
import type { ChartType, MetricKey } from '../types'

const CHART_TYPES: ChartType[] = ['bar', 'pie', 'line', 'area']

const COMPLEX_KEYS: MetricKey[] = ['dailyCallsChart', 'dailyInterestChart', 'dayByDayTable', 'niReasonLog']

const WIDGET_CATALOG: { metricKey: MetricKey; defaultChartType: ChartType }[] = [
  { metricKey: 'totalCalls', defaultChartType: 'bar' },
  { metricKey: 'totalAnswered', defaultChartType: 'bar' },
  { metricKey: 'totalInterested', defaultChartType: 'bar' },
  { metricKey: 'totalNotInterested', defaultChartType: 'bar' },
  { metricKey: 'suspendTotal', defaultChartType: 'bar' },
  { metricKey: 'hangUpTotal', defaultChartType: 'bar' },
  { metricKey: 'noAnswerTotal', defaultChartType: 'bar' },
  { metricKey: 'answerRate', defaultChartType: 'pie' },
  { metricKey: 'interestRate', defaultChartType: 'bar' },
  { metricKey: 'notInterestedRate', defaultChartType: 'bar' },
  { metricKey: 'rejectionBreakdown', defaultChartType: 'pie' },
  { metricKey: 'dailyCallsChart', defaultChartType: 'bar' },
  { metricKey: 'dailyInterestChart', defaultChartType: 'bar' },
  { metricKey: 'dayByDayTable', defaultChartType: 'bar' },
  { metricKey: 'niReasonLog', defaultChartType: 'bar' },
]

export default function Dashboard() {
  const {
    reports, labels, widgets, editMode,
    updateWidgets, toggleWidget, setWidgetChartType,
    addWidget, removeWidget, resetWidgets,
  } = useStore()

  const [showPicker, setShowPicker] = useState(false)

  const metrics = useMemo(() => computeMetrics(reports, labels), [reports, labels])

  const layout: Layout = widgets
    .filter((w) => w.visible)
    .map((w) => ({ i: w.id, x: w.x, y: w.y, w: w.w, h: w.h, minW: 2, minH: 2 }))

  const onLayoutChange = useCallback(
    (newLayout: Layout) => {
      updateWidgets(
        widgets.map((w) => {
          const l = newLayout.find((n) => n.i === w.id)
          if (!l) return w
          return { ...w, x: l.x, y: l.y, w: l.w, h: l.h }
        })
      )
    },
    [widgets, updateWidgets]
  )

  const visibleWidgets = widgets.filter((w) => w.visible)

  const renderContent = (metricKey: MetricKey, chartType: ChartType, widgetH: number) => {
    switch (metricKey) {
      case 'dailyCallsChart':
        return <DailyCallsWidget data={metrics.dailyBreakdown} />
      case 'dailyInterestChart':
        return <DailyInterestWidget data={metrics.dailyBreakdown} />
      case 'dayByDayTable':
        return <DayByDayTableWidget data={metrics.dailyBreakdown} />
      case 'niReasonLog':
        return <NiReasonLogWidget data={metrics.rejectionBreakdown} />
      default:
        return (
          <MetricCard
            metricKey={metricKey}
            chartType={chartType}
            metrics={metrics}
            compact={widgetH <= 2}
          />
        )
    }
  }

  return (
    <div>
      {editMode && (
        <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-4">
          {/* Header row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-700">Dashboard Customization</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Drag &amp; resize widgets. Toggle visibility, change chart type, or remove individual cards.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setShowPicker((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                <Plus size={14} />
                Add Widget
                {showPicker ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
              <button
                onClick={resetWidgets}
                className="inline-flex items-center rounded-lg border border-indigo-300 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
              >
                Reset layout
              </button>
            </div>
          </div>

          {/* Widget picker */}
          {showPicker && (
            <div className="p-3 bg-white rounded-lg border border-indigo-200">
              <p className="text-xs font-medium text-slate-500 mb-2">
                Select a widget type to add to the dashboard:
              </p>
              <div className="flex flex-wrap gap-2">
                {WIDGET_CATALOG.map(({ metricKey, defaultChartType }) => (
                  <button
                    key={metricKey}
                    onClick={() => {
                      addWidget(metricKey, defaultChartType)
                      setShowPicker(false)
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                  >
                    <Plus size={11} />
                    {METRIC_LABELS[metricKey]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Existing widget list */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {widgets.map((w) => (
              <div
                key={w.id}
                className={`flex flex-col gap-1.5 p-2.5 rounded-lg border text-xs ${
                  w.visible
                    ? 'border-indigo-300 bg-white'
                    : 'border-slate-200 bg-slate-50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={w.visible}
                    onChange={() => toggleWidget(w.id)}
                    className="accent-indigo-600 flex-shrink-0"
                  />
                  <span className="font-medium text-slate-700 flex-1 truncate min-w-0">
                    {METRIC_LABELS[w.metricKey]}
                  </span>
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => removeWidget(w.id)}
                    className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors"
                    title="Remove widget"
                  >
                    <X size={12} />
                  </button>
                </div>
                {w.visible && !COMPLEX_KEYS.includes(w.metricKey) && (
                  <select
                    value={w.chartType}
                    onChange={(e) => setWidgetChartType(w.id, e.target.value as ChartType)}
                    className="border border-slate-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {CHART_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)} chart
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-indigo-400">
            Tip: Drag widgets to reorder. Resize by dragging the bottom-right corner handle.
          </p>
        </div>
      )}

      {visibleWidgets.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          No widgets visible. Enable some in edit mode.
        </div>
      ) : (
        <GridLayout
          layout={layout}
          width={1200}
          gridConfig={{ cols: 12, rowHeight: 80, margin: [12, 12] }}
          dragConfig={{ enabled: editMode }}
          resizeConfig={{ enabled: editMode, handles: ['se'] }}
          onLayoutChange={onLayoutChange}
          autoSize
        >
          {visibleWidgets.map((w) => (
            <div
              key={w.id}
              className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-4 overflow-hidden relative group ${
                editMode ? 'ring-1 ring-indigo-200' : ''
              }`}
            >
              {editMode && (
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => removeWidget(w.id)}
                  className="absolute top-2 right-2 z-10 w-5 h-5 flex items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove widget"
                >
                  <X size={11} />
                </button>
              )}
              {renderContent(w.metricKey, w.chartType, w.h)}
            </div>
          ))}
        </GridLayout>
      )}
    </div>
  )
}
