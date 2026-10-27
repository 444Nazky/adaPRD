import {
  Check,
  FileText,
  HardDrive,
  Home,
  Menu,
  Moon,
  Network,
  PackageOpen,
  Plus,
  Settings2,
  Share2,
  Sun,
  X,
  ArrowUpRight,
} from 'lucide-react'
import type { PRD, Theme, Toast, View } from '../types'
import { formatDate, truncate } from '../lib/utils'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`logo ${compact ? 'is-compact' : ''}`} aria-label="adaPRD">
      <span className="logo-mark" aria-hidden="true">
        <span>a</span>
      </span>
      {!compact && (
        <span className="logo-word">
          ada<span>PRD</span>
        </span>
      )}
    </span>
  )
}

export function Sidebar({
  view,
  prd,
  projects,
  open,
  theme,
  onClose,
  onNavigate,
  onNew,
  onSelectProject,
  onOpenSettings,
}: {
  view: View
  prd: PRD | null
  projects: PRD[]
  open: boolean
  theme: Theme
  onClose: () => void
  onNavigate: (view: View) => void
  onNew: () => void
  onSelectProject: (project: PRD) => void
  onOpenSettings: () => void
}) {
  const go = (next: View) => {
    onNavigate(next)
    onClose()
  }
  const navItems: Array<{ view: View; label: string; icon: typeof Home; meta?: string }> = [
    { view: 'home', label: 'Beranda', icon: Home },
    { view: 'document', label: 'Dokumen PRD', icon: FileText, meta: prd ? '11' : undefined },
    { view: 'visuals', label: 'Peta visual', icon: Network, meta: prd ? '3' : undefined },
    { view: 'export', label: 'Ekspor & bagikan', icon: PackageOpen },
  ]
  return (
    <>
      <div className={`sidebar-scrim ${open ? 'is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar-header">
          <button className="brand-button" type="button" onClick={() => go('home')}>
            <Logo />
          </button>
          <button className="icon-button sidebar-close" type="button" onClick={onClose} aria-label="Tutup menu">
            <X size={18} />
          </button>
        </div>

        <button className="new-prd-button" type="button" onClick={() => { onNew(); onClose() }}>
          <span className="new-prd-icon"><Plus size={16} /></span>
          <span>PRD baru</span>
          <kbd>N</kbd>
        </button>

        <div className="sidebar-scroll">
          <p className="nav-label">Ruang kerja</p>
          <nav className="sidebar-nav" aria-label="Navigasi utama">
            {navItems.map((item) => {
              const Icon = item.icon
              const disabled = item.view !== 'home' && !prd
              return (
                <button
                  key={item.view}
                  type="button"
                  disabled={disabled}
                  className={`nav-item ${view === item.view ? 'is-active' : ''}`}
                  onClick={() => go(item.view)}
                >
                  <Icon size={17} strokeWidth={1.8} />
                  <span>{item.label}</span>
                  {item.meta && <span className="nav-meta">{item.meta}</span>}
                </button>
              )
            })}
          </nav>

          <div className="sidebar-divider" />
          <div className="recent-header">
            <p className="nav-label">Terakhir dibuat</p>
            {projects.length > 0 && <span>{projects.length}</span>}
          </div>
          {projects.length === 0 ? (
            <div className="recent-empty">
              <span className="recent-empty-icon"><FileText size={16} /></span>
              <p>Belum ada dokumen. Mulai dari satu ide.</p>
            </div>
          ) : (
            <div className="recent-list">
              {projects.slice(0, 5).map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={`recent-item ${prd?.id === project.id ? 'is-active' : ''}`}
                  onClick={() => { onSelectProject(project); onClose() }}
                >
                  <span className="recent-dot" />
                  <span className="recent-copy">
                    <strong>{truncate(project.title, 29)}</strong>
                    <span>{formatDate(project.updatedAt)}</span>
                  </span>
                  <ArrowUpRight size={14} className="recent-arrow" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="local-status">
            <HardDrive size={14} />
            <span>Local-first · tersimpan di perangkat</span>
          </div>
          <button className="settings-button" type="button" onClick={onOpenSettings}>
            <Settings2 size={16} />
            <span>Preferensi</span>
            <span className="theme-hint">{theme === 'dark' ? 'Gelap' : 'Terang'}</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export function Topbar({
  view,
  prd,
  saveState,
  onOpenMenu,
  onShare,
  onExport,
  theme,
  onToggleTheme,
  onHome,
}: {
  view: View
  prd: PRD | null
  saveState: 'saved' | 'saving'
  onOpenMenu: () => void
  onShare: () => void
  onExport: () => void
  theme: Theme
  onToggleTheme: () => void
  onHome: () => void
}) {
  const sectionName = {
    home: 'Ruang kerja',
    document: 'Dokumen PRD',
    visuals: 'Peta visual',
    export: 'Ekspor & bagikan',
  }[view]
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button mobile-menu" type="button" onClick={onOpenMenu} aria-label="Buka menu">
          <Menu size={20} />
        </button>
        <div className="breadcrumbs">
          <button type="button" className="crumb-home" onClick={onHome} aria-label="Beranda">
            <span className="mobile-logo"><Logo compact /></span>
          </button>
          <span className="crumb-root">{sectionName}</span>
          {prd && view !== 'home' && (
            <>
              <span className="crumb-separator">/</span>
              <span className="crumb-current">{truncate(prd.title, 36)}</span>
            </>
          )}
        </div>
      </div>
      <div className="topbar-right">
        {prd && view !== 'home' && (
          <span className={`save-indicator ${saveState === 'saving' ? 'is-saving' : ''}`}>
            {saveState === 'saved' ? <Check size={12} /> : <span className="saving-spinner" />}
            {saveState === 'saved' ? 'Tersimpan' : 'Menyimpan'}
          </span>
        )}
        <button className="icon-button theme-button" type="button" onClick={onToggleTheme} aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'} title={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {prd && view !== 'home' && (
          <>
            <button className="button ghost share-button" type="button" onClick={onShare}>
              <Share2 size={15} /> <span>Bagikan</span>
            </button>
            <button className="button primary export-top-button" type="button" onClick={onExport}>
              <PackageOpen size={15} /> <span>Ekspor</span>
            </button>
          </>
        )}
      </div>
    </header>
  )
}

export function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.kind}`}>
          <span className="toast-icon">
            {toast.kind === 'success' ? <Check size={14} /> : toast.kind === 'error' ? <X size={14} /> : <span className="toast-dot" />}
          </span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
