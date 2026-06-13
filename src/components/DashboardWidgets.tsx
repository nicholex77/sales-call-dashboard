import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import type { DailyBreakdown } from '../utils/metrics'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="h-full flex flex-col">
      <p className="text-xs font-semibold text-slate-700 mb-2">{title}</p>
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        No data yet — add a report to see data here.
      </div>
    </div>
  )
}

export function DailyCallsWidget({ data }: { data: DailyBreakdown[] }) {
  if (data.length === 0) return <EmptyState title="Daily calls — total vs answered" />

  const chartData = data.map((d) => ({
    date: formatDate(d.date),
    Total: d.total,
    Answered: d.answered,
  }))

  return (
    <div className="h-full flex flex-col">
      <p className="text-xs font-semibold text-slate-700 mb-1">Daily calls — total vs answered</p>
      <div className="flex items-center gap-4 mb-2">
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-3 h-3 inline-block rounded-sm bg-blue-500" />
          Total
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-3 h-3 inline-block rounded-sm bg-emerald-500" />
          Answered
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar dataKey="Total" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={40} />
            <Bar dataKey="Answered" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function DailyInterestWidget({ data }: { data: DailyBreakdown[] }) {
  if (data.length === 0) return <EmptyState title="Daily interested vs NI" />

  const chartData = data.map((d) => ({
    date: formatDate(d.date),
    Interested: d.interested,
    NI: d.notInterested,
  }))

  return (
    <div className="h-full flex flex-col">
      <p className="text-xs font-semibold text-slate-700 mb-1">Daily interested vs NI</p>
      <div className="flex items-center gap-4 mb-2">
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-3 h-3 inline-block rounded-sm bg-emerald-500" />
          Interested
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-3 h-3 inline-block rounded-sm bg-red-500" />
          NI
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar dataKey="Interested" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={40} />
            <Bar dataKey="NI" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function rateColor(rate: number) {
  if (rate >= 30) return 'bg-green-100 text-green-700'
  if (rate >= 15) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

export function DayByDayTableWidget({ data }: { data: DailyBreakdown[] }) {
  if (data.length === 0) return <EmptyState title="Day-by-day breakdown" />

  const totals = data.reduce(
    (acc, d) => ({
      total: acc.total + d.total,
      answered: acc.answered + d.answered,
      noAnswer: acc.noAnswer + d.noAnswer,
      noAnswer2x: acc.noAnswer2x + d.noAnswer2x,
      interested: acc.interested + d.interested,
      notInterested: acc.notInterested + d.notInterested,
      suspend: acc.suspend + d.suspend,
      hangUp: acc.hangUp + d.hangUp,
    }),
    { total: 0, answered: 0, noAnswer: 0, noAnswer2x: 0, interested: 0, notInterested: 0, suspend: 0, hangUp: 0 }
  )

  const totalAnswerRate = totals.total > 0 ? (totals.answered / totals.total) * 100 : 0
  const totalInterestRate = totals.answered > 0 ? (totals.interested / totals.answered) * 100 : 0

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <p className="text-xs font-semibold text-slate-700 mb-2">Day-by-day breakdown</p>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-200">
              {['Date', 'Total', 'Answered', 'NA', 'NA 2x', 'Interested', 'NI', 'Suspend', 'Hang up', 'Answer %', 'Interest %'].map((h) => (
                <th
                  key={h}
                  className={`py-2 font-medium text-slate-500 ${h === 'Date' ? 'text-left pr-3' : 'text-right px-2'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.date} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-2 pr-3 font-medium text-slate-700">{formatDate(d.date)}</td>
                <td className="text-right py-2 px-2 text-slate-600">{d.total || '—'}</td>
                <td className="text-right py-2 px-2 text-slate-600">{d.answered}</td>
                <td className="text-right py-2 px-2 text-slate-600">{d.noAnswer}</td>
                <td className="text-right py-2 px-2 text-slate-600">{d.noAnswer2x || '—'}</td>
                <td className="text-right py-2 px-2 text-slate-600">{d.interested}</td>
                <td className="text-right py-2 px-2 text-slate-600">{d.notInterested}</td>
                <td className="text-right py-2 px-2 text-slate-600">{d.suspend || '—'}</td>
                <td className="text-right py-2 px-2 text-slate-600">{d.hangUp || '—'}</td>
                <td className="text-right py-2 px-2">
                  <span className={`px-1.5 py-0.5 rounded font-medium ${rateColor(d.answerRate)}`}>
                    {d.answerRate.toFixed(1)}%
                  </span>
                </td>
                <td className="text-right py-2 pl-2">
                  <span className={`px-1.5 py-0.5 rounded font-medium ${rateColor(d.interestRate)}`}>
                    {d.interestRate.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 font-semibold bg-slate-50">
              <td className="py-2 pr-3 text-slate-700">Total</td>
              <td className="text-right py-2 px-2 text-slate-700">{totals.total}</td>
              <td className="text-right py-2 px-2 text-slate-700">{totals.answered}</td>
              <td className="text-right py-2 px-2 text-slate-700">{totals.noAnswer}</td>
              <td className="text-right py-2 px-2 text-slate-700">{totals.noAnswer2x}</td>
              <td className="text-right py-2 px-2 text-slate-700">{totals.interested}</td>
              <td className="text-right py-2 px-2 text-slate-700">{totals.notInterested}</td>
              <td className="text-right py-2 px-2 text-slate-700">{totals.suspend}</td>
              <td className="text-right py-2 px-2 text-slate-700">{totals.hangUp}</td>
              <td className="text-right py-2 px-2">
                <span className={`px-1.5 py-0.5 rounded font-medium ${rateColor(totalAnswerRate)}`}>
                  {totalAnswerRate.toFixed(1)}%
                </span>
              </td>
              <td className="text-right py-2 pl-2">
                <span className={`px-1.5 py-0.5 rounded font-medium ${rateColor(totalInterestRate)}`}>
                  {totalInterestRate.toFixed(1)}%
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export function NiReasonLogWidget({
  data,
}: {
  data: { label: string; count: number; color: string }[]
}) {
  const total = data.reduce((s, d) => s + d.count, 0)

  if (data.length === 0) return <EmptyState title="NI Reason Log" />

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <p className="text-xs font-semibold text-slate-700 mb-3">
        NI Reason Log{' '}
        <span className="font-normal text-slate-400">({total} entries)</span>
      </p>
      <div className="flex flex-wrap gap-3 overflow-auto">
        {data.map((d) => (
          <div
            key={d.label}
            className="flex-shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-w-[130px]"
          >
            <p className="text-xs text-slate-500 mb-1 truncate">{d.label}</p>
            <p className="text-2xl font-bold text-slate-800">{d.count}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {total > 0 ? ((d.count / total) * 100).toFixed(1) : 0}% of NI log
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
