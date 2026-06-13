import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { useStore } from '../store/useStore'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#6366f1', '#a855f7', '#ec4899',
]

export default function RejectionLabelsManager() {
  const { labels, addLabel, updateLabel, deleteLabel } = useStore()
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])

  const startAdd = () => {
    setAdding(true)
    setEditingId(null)
    setName('')
    setColor(PRESET_COLORS[0])
  }

  const startEdit = (id: string) => {
    const label = labels.find((l) => l.id === id)
    if (!label) return
    setEditingId(id)
    setAdding(false)
    setName(label.name)
    setColor(label.color)
  }

  const cancel = () => {
    setAdding(false)
    setEditingId(null)
    setName('')
  }

  const save = () => {
    if (!name.trim()) return
    if (adding) {
      addLabel(name.trim(), color)
    } else if (editingId) {
      updateLabel(editingId, name.trim(), color)
    }
    cancel()
  }

  return (
    <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Rejection Reason Labels</h3>
        <button
          onClick={startAdd}
          className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
        >
          <Plus size={16} /> Add Label
        </button>
      </div>

      <div className="space-y-2">
        {labels.map((label) =>
          editingId === label.id ? (
            <InlineEditor
              key={label.id}
              name={name}
              color={color}
              onName={setName}
              onColor={setColor}
              onSave={save}
              onCancel={cancel}
            />
          ) : (
            <div
              key={label.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 group"
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: label.color }}
              />
              <span className="text-sm text-slate-200 flex-1">{label.name}</span>
              <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                <button
                  onClick={() => startEdit(label.id)}
                  className="p-1 text-slate-500 hover:text-indigo-400"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => deleteLabel(label.id)}
                  className="p-1 text-slate-500 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        )}

        {adding && (
          <InlineEditor
            name={name}
            color={color}
            onName={setName}
            onColor={setColor}
            onSave={save}
            onCancel={cancel}
          />
        )}

        {labels.length === 0 && !adding && (
          <p className="text-sm text-slate-500 text-center py-4">
            No labels yet. Add one above.
          </p>
        )}
      </div>
    </div>
  )
}

function InlineEditor({
  name,
  color,
  onName,
  onColor,
  onSave,
  onCancel,
}: {
  name: string
  color: string
  onName: (v: string) => void
  onColor: (v: string) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="border border-indigo-800 rounded-lg p-3 space-y-2 bg-slate-800">
      <input
        autoFocus
        type="text"
        placeholder="Label name"
        className="w-full border border-slate-600 rounded-lg px-3 py-1.5 text-sm bg-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={name}
        onChange={(e) => onName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSave()}
      />
      <div className="flex items-center gap-2 flex-wrap">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onColor(c)}
            className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              background: c,
              borderColor: color === c ? '#f1f5f9' : 'transparent',
            }}
          />
        ))}
        <input
          type="color"
          value={color}
          onChange={(e) => onColor(e.target.value)}
          className="w-6 h-6 rounded-full border border-slate-600 cursor-pointer bg-transparent"
          title="Custom color"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="p-1 text-slate-500 hover:text-slate-300"
        >
          <X size={16} />
        </button>
        <button
          onClick={onSave}
          className="p-1 text-indigo-400 hover:text-indigo-300"
        >
          <Check size={16} />
        </button>
      </div>
    </div>
  )
}
