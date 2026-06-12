import { useMemo, useCallback } from 'react'
import { GridLayout } from 'react-grid-layout'
import type { Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { useStore } from '../store/useStore'
import { computeMetrics, METRIC_LABELS } from '../utils/metrics'
import MetricCard from './MetricCard'
import type { ChartType, MetricKey } from '../types'

const CHART_TYPES: ChartType[] = ['bar', 'pie', 'line', 'area']

export default function Dashboard() {
  const { reports, labels, widgets, editMode, updateWidgets, toggleWidget, setWidgetChartType } = useStore()

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

  return (
    <div>
      {editMode && (
        <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
          <p className="text-sm font-medium text-indigo-700 mb-3">Dashboard Customization</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {widgets.map((w) => (
              <div
                key={w.id}
                className={`flex flex-col gap-1.5 p-2.5 rounded-lg border text-xs ${
                  w.visible
                    ? 'border-indigo-300 bg-white'
                    : 'border-slate-200 bg-slate-50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={w.visible}
                    onChange={() => toggleWidget(w.id)}
                    className="accent-indigo-600"
                  />
                  <span className="font-medium text-slate-700">{METRIC_LABELS[w.metricKey]}</span>
                </div>
                {w.visible && (
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
          <p className="text-xs text-indigo-500 mt-3">
            Drag widgets to reorder. Resize by dragging the bottom-right corner.
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
          width={1100}
          gridConfig={{ cols: 8, rowHeight: 80, margin: [12, 12] }}
          dragConfig={{ enabled: editMode }}
          resizeConfig={{ enabled: editMode, handles: ['se'] }}
          onLayoutChange={onLayoutChange}
          autoSize
        >
          {visibleWidgets.map((w) => (
            <div
              key={w.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 overflow-hidden"
            >
              <MetricCard
                metricKey={w.metricKey as MetricKey}
                chartType={w.chartType}
                metrics={metrics}
              />
            </div>
          ))}
        </GridLayout>
      )}
    </div>
  )
}
