import { useState } from 'react'
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { CallReport } from '../types'
import CallEntryForm from './CallEntryForm'

export default function ReportsTable() {
  const { reports, labels, deleteReport } = useStore()
  const [editing, setEditing] = useState<CallReport | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const sorted = [...reports].sort((a, b) => b.date.localeCompare(a.date))

  if (sorted.length === 0) {
    return (
      <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-700 p-8 text-center text-slate-500 text-sm">
        No call reports yet. Add your first one above.
      </div>
    )
  }

  return (
    <>
      {editing && <CallEntryForm editing={editing} onClose={() => setEditing(null)} />}
      <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 border-b border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-400 text-xs uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 font-medium text-slate-400 text-xs uppercase tracking-wide">Agent</th>
                <th className="text-right px-3 py-3 font-medium text-slate-400 text-xs uppercase tracking-wide">Answered</th>
                <th className="text-right px-3 py-3 font-medium text-slate-400 text-xs uppercase tracking-wide">N/A 1x</th>
                <th className="text-right px-3 py-3 font-medium text-slate-400 text-xs uppercase tracking-wide">N/A 2x</th>
                <th className="text-right px-3 py-3 font-medium text-slate-400 text-xs uppercase tracking-wide">N/A 3x</th>
                <th className="text-right px-3 py-3 font-medium text-slate-400 text-xs uppercase tracking-wide">Interested</th>
                <th className="text-right px-3 py-3 font-medium text-slate-400 text-xs uppercase tracking-wide">Not Int.</th>
                <th className="text-right px-3 py-3 font-medium text-slate-400 text-xs uppercase tracking-wide">Suspend</th>
                <th className="text-right px-3 py-3 font-medium text-slate-400 text-xs uppercase tracking-wide">Hang Up</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sorted.map((r) => (
                <>
                  <tr key={r.id} className="hover:bg-slate-800 transition-colors">
                    <td className="px-4 py-3 text-slate-200">{r.date}</td>
                    <td className="px-4 py-3 text-slate-200">{r.agentName || '—'}</td>
                    <td className="px-3 py-3 text-right text-slate-200">{r.answered}</td>
                    <td className="px-3 py-3 text-right text-slate-400">{r.noAnswer}</td>
                    <td className="px-3 py-3 text-right text-slate-400">{r.noAnswer2x}</td>
                    <td className="px-3 py-3 text-right text-slate-400">{r.noAnswer3x}</td>
                    <td className="px-3 py-3 text-right font-medium text-emerald-400">{r.interested}</td>
                    <td className="px-3 py-3 text-right font-medium text-red-400">{r.notInterested}</td>
                    <td className="px-3 py-3 text-right text-slate-400">{r.suspend ?? 0}</td>
                    <td className="px-3 py-3 text-right text-slate-400">{r.hangUp ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                          className="p-1 text-slate-500 hover:text-indigo-400"
                          title="View details"
                        >
                          {expanded === r.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                        <button
                          onClick={() => setEditing(r)}
                          className="p-1 text-slate-500 hover:text-indigo-400"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => deleteReport(r.id)}
                          className="p-1 text-slate-500 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded === r.id && (
                    <tr key={`${r.id}-expanded`} className="bg-slate-800/50">
                      <td colSpan={11} className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Rejection Breakdown</p>
                            {labels.length === 0 || Object.keys(r.rejectionBreakdown).length === 0 ? (
                              <p className="text-sm text-slate-500">No rejection data</p>
                            ) : (
                              <div className="space-y-1">
                                {labels.map((l) => {
                                  const count = r.rejectionBreakdown[l.id] ?? 0
                                  if (count === 0) return null
                                  return (
                                    <div key={l.id} className="flex items-center gap-2 text-sm">
                                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                                      <span className="text-slate-200">{l.name}</span>
                                      <span className="ml-auto font-medium text-slate-100">{count}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                          {r.remarks && (
                            <div>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Remarks</p>
                              <p className="text-sm text-slate-200 whitespace-pre-wrap">{r.remarks}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
