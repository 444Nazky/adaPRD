import { FileText, Network, PackageOpen, PencilLine, Sparkles, ArrowUpRight } from 'lucide-react'
import type { PRD, View } from '../types'

const tabs: Array<{ view: View; label: string; icon: typeof FileText; number: string }> = [
  { view: 'document', label: 'Dokumen', icon: FileText, number: '01' },
  { view: 'visuals', label: 'Peta visual', icon: Network, number: '02' },
  { view: 'export', label: 'Ekspor', icon: PackageOpen, number: '03' },
]

export function WorkspaceTabs({ view, prd, onChange }: { view: View; prd: PRD; onChange: (view: View) => void }) {
  const hint = view === 'document'
    ? { icon: PencilLine, text: 'Klik teks mana pun untuk menyunting' }
    : view === 'visuals'
      ? { icon: Sparkles, text: 'Diagram mengikuti dokumen secara otomatis' }
      : { icon: ArrowUpRight, text: 'Semua artefak siap dibagikan' }
  const HintIcon = hint.icon
  return (
    <div className="workspace-tabs-bar">
      <div className="workspace-tabs" role="tablist" aria-label="Area workspace">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.view}
              role="tab"
              aria-selected={view === tab.view}
              type="button"
              className={`workspace-tab ${view === tab.view ? 'is-active' : ''}`}
              onClick={() => onChange(tab.view)}
            >
              <span className="workspace-tab-number">{tab.number}</span>
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
      <div className="workspace-hint">
        <HintIcon size={12} />
        <span>{hint.text}</span>
        <span className="hint-divider" />
        <span className="hint-version">PRD v{prd.status === 'Final' ? '1.0' : '0.1'}</span>
      </div>
    </div>
  )
}
