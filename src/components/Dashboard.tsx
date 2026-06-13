import { useMemo, useCallback, useState } from 'react'
import { GridLayout, useContainerWidth } from 'react-grid-layout'
import type { Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Plus, X, ChevronDown, ChevronUp, GripHorizontal } from 'lucide-react'
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
  const { width: containerWidth, containerRef, mounted } = useContainerWidth()

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

  const renderContent = (metricKey: MetricKey, chartType: ChartType) => {
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
        return <MetricCard metricKey={metricKey} chartType={chartType} metrics={metrics} />
    }
  }

  return (
    <div>
      {/* Edit mode panel */}
      {editMode && (
        <div className="mb-4 p-4 bg-indigo-950 border border-indigo-800 rounded-xl space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-400">Customize Layout</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Drag the grip handle to reorder · resize from the bottom-right corner · toggle or remove widgets below
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
                className="inline-flex items-center rounded-lg border border-indigo-700 bg-slate-900 px-3 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-900 transition-colors"
              >
                Reset layout
              </button>
            </div>
          </div>

          {showPicker && (
            <div className="p-3 bg-slate-800 rounded-lg border border-indigo-800">
              <p className="text-xs font-medium text-slate-400 mb-2">Click to add to dashboard:</p>
              <div className="flex flex-wrap gap-2">
                {WIDGET_CATALOG.map(({ metricKey, defaultChartType }) => (
                  <button
                    key={metricKey}
                    onClick={() => { addWidget(metricKey, defaultChartType); setShowPicker(false) }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-700 border border-slate-600 rounded-lg hover:bg-indigo-900 hover:border-indigo-600 hover:text-indigo-300 transition-colors text-slate-300"
                  >
                    <Plus size={11} />
                    {METRIC_LABELS[metricKey]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {widgets.map((w) => (
              <div
                key={w.id}
                className={`flex flex-col gap-1.5 p-2.5 rounded-lg border text-xs ${
                  w.visible ? 'border-indigo-700 bg-slate-800' : 'border-slate-700 bg-slate-800 opacity-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={w.visible}
                    onChange={() => toggleWidget(w.id)}
                    className="accent-indigo-500 flex-shrink-0"
                  />
                  <span className="font-medium text-slate-200 flex-1 truncate min-w-0">
                    {METRIC_LABELS[w.metricKey]}
                  </span>
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => removeWidget(w.id)}
                    className="flex-shrink-0 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
                {w.visible && !COMPLEX_KEYS.includes(w.metricKey) && (
                  <select
                    value={w.chartType}
                    onChange={(e) => setWidgetChartType(w.id, e.target.value as ChartType)}
                    className="border border-slate-600 rounded px-1.5 py-1 text-xs bg-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
        </div>
      )}

      {visibleWidgets.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          No widgets visible. Enable some in edit mode.
        </div>
      ) : (
        <div ref={containerRef}>
          {mounted && (
            <GridLayout
              layout={layout}
              width={containerWidth}
              gridConfig={{ cols: 12, rowHeight: 72, margin: [10, 10] }}
              dragConfig={{ enabled: editMode, handle: '.drag-handle' }}
              resizeConfig={{ enabled: editMode, handles: ['se'] }}
              onLayoutChange={onLayoutChange}
              autoSize
            >
              {visibleWidgets.map((w) => (
                <div
                  key={w.id}
                  className={`bg-slate-900 rounded-xl border border-slate-800 p-4 overflow-hidden relative group flex flex-col ${
                    editMode ? 'ring-1 ring-indigo-800/60' : ''
                  }`}
                >
                  {/* Drag handle — only visible in edit mode */}
                  {editMode && (
                    <div className="drag-handle absolute top-0 left-0 right-0 h-7 flex items-center justify-center cursor-grab active:cursor-grabbing z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripHorizontal size={16} className="text-slate-500" />
                    </div>
                  )}
                  {/* Remove button */}
                  {editMode && (
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => removeWidget(w.id)}
                      className="absolute top-1.5 right-1.5 z-20 w-5 h-5 flex items-center justify-center rounded-full bg-red-950/80 border border-red-800 text-red-400 hover:bg-red-900 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={11} />
                    </button>
                  )}
                  <div className={`flex-1 min-h-0 ${editMode ? 'pt-4' : ''}`}>
                    {renderContent(w.metricKey, w.chartType)}
                  </div>
                </div>
              ))}
            </GridLayout>
          )}
        </div>
      )}
    </div>
  )
}
