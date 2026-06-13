import { useState } from 'react'
import { X } from 'lucide-react'
import { useStore } from '../store/useStore'
import type { CallReport } from '../types'

interface Props {
  onClose: () => void
  editing?: CallReport
}

function numField(val: string) {
  const n = parseInt(val, 10)
  return isNaN(n) || n < 0 ? 0 : n
}

export default function CallEntryForm({ onClose, editing }: Props) {
  const { labels, addReport, updateReport } = useStore()

  const [form, setForm] = useState({
    date: editing?.date ?? new Date().toISOString().slice(0, 10),
    agentName: editing?.agentName ?? '',
    noAnswer: String(editing?.noAnswer ?? 0),
    noAnswer2x: String(editing?.noAnswer2x ?? 0),
    noAnswer3x: String(editing?.noAnswer3x ?? 0),
    answered: String(editing?.answered ?? 0),
    interested: String(editing?.interested ?? 0),
    notInterested: String(editing?.notInterested ?? 0),
    suspend: String(editing?.suspend ?? 0),
    hangUp: String(editing?.hangUp ?? 0),
    remarks: editing?.remarks ?? '',
    rejectionBreakdown: editing?.rejectionBreakdown ?? {} as Record<string, number>,
  })

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const setRejection = (id: string, value: string) =>
    setForm((f) => ({
      ...f,
      rejectionBreakdown: { ...f.rejectionBreakdown, [id]: numField(value) },
    }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      date: form.date,
      agentName: form.agentName,
      noAnswer: numField(form.noAnswer),
      noAnswer2x: numField(form.noAnswer2x),
      noAnswer3x: numField(form.noAnswer3x),
      answered: numField(form.answered),
      interested: numField(form.interested),
      notInterested: numField(form.notInterested),
      suspend: numField(form.suspend),
      hangUp: numField(form.hangUp),
      remarks: form.remarks,
      rejectionBreakdown: form.rejectionBreakdown,
    }
    if (editing) {
      updateReport(editing.id, payload)
    } else {
      addReport(payload)
    }
    onClose()
  }

  const outcomeFields = [
    { key: 'noAnswer', label: 'No Answer (1x)' },
    { key: 'noAnswer2x', label: 'No Answer (2x)' },
    { key: 'noAnswer3x', label: 'No Answer (3x)' },
    { key: 'answered', label: 'Answered' },
    { key: 'interested', label: 'Interested' },
    { key: 'notInterested', label: 'Not Interested' },
    { key: 'suspend', label: 'Suspend' },
    { key: 'hangUp', label: 'Hang Up' },
  ]

  const inputCls = 'w-full border border-slate-600 rounded-lg px-3 py-2 text-sm bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">
            {editing ? 'Edit Call Report' : 'New Call Report'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                required
                className={inputCls}
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Agent Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                className={inputCls}
                value={form.agentName}
                onChange={(e) => set('agentName', e.target.value)}
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-300 mb-2">Call Outcomes</p>
            <div className="grid grid-cols-4 gap-3">
              {outcomeFields.map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs text-slate-400 mb-1">{label}</label>
                  <input
                    type="number"
                    min="0"
                    className={inputCls}
                    value={form[key as keyof typeof form] as string}
                    onChange={(e) => set(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {labels.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-300 mb-2">
                Rejection Reasons{' '}
                <span className="text-xs font-normal text-slate-500">(for Not Interested agents)</span>
              </p>
              <div className="space-y-2">
                {labels.map((label) => (
                  <div key={label.id} className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: label.color }}
                    />
                    <span className="text-sm text-slate-200 flex-1">{label.name}</span>
                    <input
                      type="number"
                      min="0"
                      className="w-20 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-center bg-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={form.rejectionBreakdown[label.id] ?? 0}
                      onChange={(e) => setRejection(label.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Remarks</label>
            <textarea
              rows={3}
              placeholder="Any notes about this session..."
              className={inputCls + ' resize-none'}
              value={form.remarks}
              onChange={(e) => set('remarks', e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-300 hover:text-slate-100 border border-slate-600 rounded-lg hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium"
            >
              {editing ? 'Save Changes' : 'Add Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
