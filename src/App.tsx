import { useState } from 'react'
import { Plus, LayoutDashboard, Table2, Tags, PenSquare } from 'lucide-react'
import { useStore } from './store/useStore'
import CallEntryForm from './components/CallEntryForm'
import Dashboard from './components/Dashboard'
import ReportsTable from './components/ReportsTable'
import RejectionLabelsManager from './components/RejectionLabelsManager'

type Tab = 'dashboard' | 'reports' | 'labels'

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [showForm, setShowForm] = useState(false)
  const { editMode, toggleEditMode, reports } = useStore()

  return (
    <div className="min-h-screen bg-slate-950">
      {showForm && <CallEntryForm onClose={() => setShowForm(false)} />}

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Sales Call Dashboard</h1>
            <p className="text-xs text-slate-500">{reports.length} report{reports.length !== 1 ? 's' : ''} logged</p>
          </div>
          <div className="flex items-center gap-3">
            {tab === 'dashboard' && (
              <button
                onClick={toggleEditMode}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  editMode
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'text-slate-300 border-slate-600 hover:bg-slate-800'
                }`}
              >
                <PenSquare size={15} />
                {editMode ? 'Done Editing' : 'Customize Layout'}
              </button>
            )}
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              New Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex gap-1 border-t border-slate-800">
          {([
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'reports', label: 'All Reports', icon: Table2 },
            { id: 'labels', label: 'Rejection Labels', icon: Tags },
          ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'reports' && <ReportsTable />}
        {tab === 'labels' && <RejectionLabelsManager />}
      </main>
    </div>
  )
}
