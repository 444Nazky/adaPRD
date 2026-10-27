import { useCallback, useEffect, useMemo, useState } from 'react'
import LZString from 'lz-string'
import type { DiagramTab, ModelSettings, PRD, Theme, Toast, ToastKind, View } from './types'
import { generatePRD } from './lib/generator'
import { getSavedSettings, saveSettings } from './lib/utils'
import { Sidebar, Topbar, ToastStack } from './components/Chrome'
import { Landing } from './components/Landing'
import { GenerationOverlay } from './components/GenerationOverlay'
import { SettingsModal, ShareModal } from './components/Modals'
import { WorkspaceTabs } from './components/WorkspaceTabs'
import { DocumentView } from './components/DocumentView'
import { DiagramView } from './components/DiagramView'
import { ExportView } from './components/ExportView'

const defaultSettings: ModelSettings = {
  provider: 'local',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
}

function isPRD(value: unknown): value is PRD {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<PRD>
  return typeof candidate.id === 'string' && typeof candidate.title === 'string' && Array.isArray(candidate.features) && Array.isArray(candidate.personas)
}

function loadSharedPRD(): PRD | null {
  try {
    if (!window.location.hash.startsWith('#share=')) return null
    const payload = window.location.hash.slice(7)
    const decoded = LZString.decompressFromEncodedURIComponent(payload)
    if (!decoded) return null
    const parsed = JSON.parse(decoded)
    return isPRD(parsed) ? parsed : null
  } catch {
    return null
  }
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = getSavedSettings<Theme | null>('adaprd:theme', null)
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [settings, setSettings] = useState<ModelSettings>(() => getSavedSettings<ModelSettings>('adaprd:settings', defaultSettings))
  const [view, setView] = useState<View>('home')
  const [prd, setPrd] = useState<PRD | null>(null)
  const [projects, setProjects] = useState<PRD[]>(() => {
    const stored = getSavedSettings<PRD[]>('adaprd:projects', [])
    return Array.isArray(stored) ? stored.filter(isPRD) : []
  })
  const [diagramTab, setDiagramTab] = useState<DiagramTab>('flow')
  const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved')
  const [generating, setGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const [generationPrompt, setGenerationPrompt] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts((current) => [...current, { id, message, kind }].slice(-4))
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3200)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    saveSettings('adaprd:theme', theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#171411' : '#f4f0e8')
  }, [theme])

  useEffect(() => {
    const shared = loadSharedPRD()
    if (!shared) return
    setPrd(shared)
    setView('document')
    setProjects((current) => {
      const next = [shared, ...current.filter((project) => project.id !== shared.id)].slice(0, 8)
      saveSettings('adaprd:projects', next)
      return next
    })
    notify('Snapshot PRD berhasil dimuat.', 'info')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!prd) return
    setSaveState('saving')
    const timeout = setTimeout(() => {
      setProjects((current) => {
        const next = [prd, ...current.filter((project) => project.id !== prd.id)]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 8)
        saveSettings('adaprd:projects', next)
        return next
      })
      setSaveState('saved')
    }, 500)
    return () => clearTimeout(timeout)
  }, [prd])

  useEffect(() => {
    const container = document.querySelector('.app-body')
    if (container) container.scrollTo({ top: 0, behavior: 'auto' })
  }, [view, prd?.id])

  const updateProject = useCallback((updater: (current: PRD) => PRD) => {
    setPrd((current) => {
      if (!current) return current
      const next = updater(current)
      return { ...next, updatedAt: new Date().toISOString() }
    })
  }, [])

  const handleGenerate = async (prompt: string) => {
    setGenerationPrompt(prompt)
    setGenerationStep(0)
    setGenerating(true)
    try {
      const result = await generatePRD(prompt, settings, setGenerationStep)
      setPrd(result)
      setProjects((current) => [result, ...current.filter((project) => project.id !== result.id)].slice(0, 8))
      setView('document')
      setDiagramTab('flow')
      setGenerating(false)
      window.setTimeout(() => notify('PRD siap. Semua teks bisa langsung disunting.', 'success'), 250)
    } catch (error) {
      console.error(error)
      setGenerating(false)
      notify('Gagal menyusun PRD. Coba lagi.', 'error')
    }
  }

  const startNew = () => {
    setPrd(null)
    setView('home')
    if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search)
  }

  const selectProject = (project: PRD) => {
    setPrd(project)
    setView('document')
    if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search)
  }

  const openDocument = () => {
    setView('document')
  }

  const shareLink = useMemo(() => {
    if (!prd) return ''
    try {
      const payload = LZString.compressToEncodedURIComponent(JSON.stringify(prd))
      return `${window.location.origin}${window.location.pathname}#share=${payload}`
    } catch {
      return window.location.href
    }
  }, [prd])

  const sidebarProjects = useMemo(
    () => prd ? [prd, ...projects.filter((project) => project.id !== prd.id)] : projects,
    [prd, projects],
  )

  const handleSettingsSave = (next: ModelSettings) => {
    setSettings(next)
    saveSettings('adaprd:settings', next)
  }

  const showWorkspace = Boolean(prd && view !== 'home')
  const engineLabel = settings.provider === 'openai' && settings.apiKey ? settings.model : 'ada engine'

  return (
    <div className="app-shell">
      <Sidebar
        view={view}
        prd={prd}
        projects={sidebarProjects}
        open={sidebarOpen}
        theme={theme}
        onClose={() => setSidebarOpen(false)}
        onNavigate={setView}
        onNew={startNew}
        onSelectProject={selectProject}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <div className="app-main">
        <Topbar
          view={view}
          prd={prd}
          saveState={saveState}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onOpenMenu={() => setSidebarOpen(true)}
          onShare={() => prd && setShareOpen(true)}
          onExport={() => prd && setView('export')}
          onHome={startNew}
        />
        {showWorkspace && prd && (
          <WorkspaceTabs view={view} prd={prd} onChange={setView} />
        )}
        <main className="app-body">
          {!showWorkspace && (
            <Landing onGenerate={handleGenerate} engineLabel={engineLabel} />
          )}
          {showWorkspace && prd && view === 'document' && (
            <DocumentView prd={prd} onChange={updateProject} notify={notify} onOpenVisuals={setView} />
          )}
          {showWorkspace && prd && view === 'visuals' && (
            <DiagramView
              prd={prd}
              tab={diagramTab}
              onTabChange={setDiagramTab}
              dark={theme === 'dark'}
              notify={notify}
              onOpenDocument={openDocument}
            />
          )}
          {showWorkspace && prd && view === 'export' && (
            <ExportView
              prd={prd}
              dark={theme === 'dark'}
              notify={notify}
              onShare={() => setShareOpen(true)}
            />
          )}
        </main>
      </div>

      {generating && <GenerationOverlay step={generationStep} prompt={generationPrompt} />}
      {settingsOpen && (
        <SettingsModal
          settings={settings}
          theme={theme}
          onSave={handleSettingsSave}
          onClose={() => setSettingsOpen(false)}
          onThemeChange={setTheme}
          notify={notify}
        />
      )}
      {shareOpen && prd && (
        <ShareModal prd={prd} shareLink={shareLink} onClose={() => setShareOpen(false)} notify={notify} />
      )}
      <ToastStack toasts={toasts} />
    </div>
  )
}
