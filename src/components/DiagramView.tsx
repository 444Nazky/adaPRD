import { useEffect, useRef, useState } from 'react'
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  FileCode2,
  Fish,
  GitBranch,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  Network,
  PencilLine,
  Sparkles,
  WandSparkles,
  X,
} from 'lucide-react'
import type { DiagramTab, PRD, ToastKind } from '../types'
import { diagramSource, getDependencyData, getFishboneData, getFlowData } from '../lib/diagrams'
import { copyText, downloadSvg, downloadSvgAsPng, slugify, truncate } from '../lib/utils'
import { Flowchart } from './Flowchart'
import { Fishbone } from './Fishbone'
import { DependencyGraph } from './DependencyGraph'

const tabMeta: Record<DiagramTab, {
  label: string
  hint: string
  kicker: string
  title: string
  description: string
  icon: typeof GitBranch
}> = {
  flow: {
    label: 'Flowchart',
    hint: 'Alur pengguna',
    kicker: 'FLOWCHART',
    title: 'Alur inti pengguna',
    description: 'Perjalanan dari titik masuk, keputusan, hingga nilai yang diterima pengguna.',
    icon: GitBranch,
  },
  fishbone: {
    label: 'Fishbone',
    hint: 'Akar masalah',
    kicker: 'ISHIKAWA',
    title: 'Analisis akar masalah',
    description: 'Penyebab potensial dikelompokkan per kategori untuk membaca risiko secara struktural.',
    icon: Fish,
  },
  dependencies: {
    label: 'Dependensi',
    hint: 'Urutan build',
    kicker: 'DEPENDENCY GRAPH',
    title: 'Relasi & urutan fitur',
    description: 'Peta dependensi antar-fitur untuk menentukan urutan implementasi yang aman.',
    icon: Network,
  },
}

export function DiagramView({
  prd,
  tab,
  onTabChange,
  dark,
  notify,
  onOpenDocument,
}: {
  prd: PRD
  tab: DiagramTab
  onTabChange: (tab: DiagramTab) => void
  dark: boolean
  notify: (message: string, kind?: ToastKind) => void
  onOpenDocument: () => void
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [copied, setCopied] = useState(false)
  const selectedFeature = prd.features.find((feature) => feature.id === selectedFeatureId) ?? null
  const meta = tabMeta[tab]
  const Icon = meta.icon

  const counts = {
    flow: (() => {
      const data = getFlowData(prd)
      return `${data.nodes.length} node · ${data.edges.length} transisi`
    })(),
    fishbone: (() => {
      const data = getFishboneData(prd)
      return `${data.groups.length} kategori · ${data.groups.reduce((sum, group) => sum + group.causes.length, 0)} penyebab`
    })(),
    dependencies: (() => {
      const data = getDependencyData(prd)
      return `${data.nodes.length} fitur · ${data.edges.length} dependensi`
    })(),
  }[tab]

  useEffect(() => {
    setSelectedFeatureId(null)
  }, [tab])

  useEffect(() => {
    if (!fullscreen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreen(false)
    }
    document.body.classList.add('no-scroll')
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('no-scroll')
      window.removeEventListener('keydown', onKey)
    }
  }, [fullscreen])

  const copySource = async () => {
    const success = await copyText(diagramSource[tab](prd))
    if (success) {
      setCopied(true)
      notify('Source Mermaid disalin.', 'success')
      setTimeout(() => setCopied(false), 1600)
    } else {
      notify('Gagal menyalin source.', 'error')
    }
  }

  const saveSvg = () => {
    if (!svgRef.current) return
    downloadSvg(svgRef.current, `${slugify(prd.title)}-${tab}`)
    notify('SVG diagram diunduh.', 'success')
  }

  const savePng = async () => {
    if (!svgRef.current) return
    try {
      await downloadSvgAsPng(svgRef.current, `${slugify(prd.title)}-${tab}`)
      notify('PNG diagram diunduh.', 'success')
    } catch {
      notify('Gagal membuat PNG. Coba SVG sebagai alternatif.', 'error')
    }
  }

  const resetLayout = () => {
    setResetKey((value) => value + 1)
    notify('Tata letak diagram dirapikan.', 'info')
  }

  const note = {
    flow: 'Diagram ini dibangun dari lima fitur teratas di dokumen. Mengubah nama fitur atau menambah fitur baru akan memperbarui node secara otomatis.',
    fishbone: 'Fishbone membaca kategori dan penyebab dari tabel risiko di PRD. Setiap suntingan pada risiko akan mengubah cabang penyebab.',
    dependencies: 'Garis menunjukkan bahwa fitur tujuan membutuhkan fitur sumber. Pilih node untuk melihat acceptance criteria dan relasinya.',
  }[tab]

  const graph = tab === 'flow' ? (
    <Flowchart
      prd={prd}
      svgRef={svgRef}
      dark={dark}
      selectedFeatureId={selectedFeatureId}
      onSelectFeature={setSelectedFeatureId}
      resetKey={resetKey}
    />
  ) : tab === 'fishbone' ? (
    <Fishbone prd={prd} svgRef={svgRef} dark={dark} resetKey={resetKey} />
  ) : (
    <DependencyGraph
      prd={prd}
      svgRef={svgRef}
      dark={dark}
      selectedFeatureId={selectedFeatureId}
      onSelectFeature={setSelectedFeatureId}
      resetKey={resetKey}
    />
  )

  return (
    <div className="workspace-view visual-workspace">
      <header className="view-page-head">
        <div>
          <span className="page-eyebrow"><Sparkles size={12} /> SYSTEM MAPS</span>
          <h1>Peta sistem <em>yang hidup.</em></h1>
          <p>Tiga sudut pandang untuk membaca alur, risiko, dan urutan build dari dokumen yang sama.</p>
        </div>
        <div className="visual-head-stats">
          <div className="visual-stat">
            <strong>03</strong>
            <span>diagram</span>
          </div>
          <div className="visual-stat">
            <strong>{String(prd.features.length).padStart(2, '0')}</strong>
            <span>fitur</span>
          </div>
          <div className="visual-live-badge">
            <span className="live-dot" />
            Live sync
          </div>
        </div>
      </header>

      <div className="diagram-switcher" role="tablist" aria-label="Jenis diagram">
        {(Object.keys(tabMeta) as DiagramTab[]).map((key, index) => {
          const item = tabMeta[key]
          const TabIcon = item.icon
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`diagram-switch ${tab === key ? 'is-active' : ''}`}
              onClick={() => onTabChange(key)}
            >
              <span className="diagram-switch-index">0{index + 1}</span>
              <span className="diagram-switch-icon"><TabIcon size={17} /></span>
              <span className="diagram-switch-copy">
                <strong>{item.label}</strong>
                <small>{item.hint}</small>
              </span>
              <ArrowUpRight size={14} className="diagram-switch-arrow" />
            </button>
          )
        })}
      </div>

      <section className={`diagram-card ${fullscreen ? 'is-fullscreen' : ''}`} aria-label={meta.title}>
        <div className="diagram-card-head">
          <div className="diagram-card-title">
            <span className="diagram-kicker"><Icon size={13} /> {meta.kicker}</span>
            <h2>{meta.title}</h2>
            <p>{meta.description}</p>
          </div>
          <div className="diagram-actions">
            <button className="diagram-action" type="button" onClick={copySource}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Tersalin' : 'Sumber'}</span>
            </button>
            <span className="action-divider" />
            <button className="diagram-action icon-only" type="button" onClick={saveSvg} title="Unduh SVG" aria-label="Unduh SVG">
              <FileCode2 size={15} />
            </button>
            <button className="diagram-action icon-only" type="button" onClick={savePng} title="Unduh PNG" aria-label="Unduh PNG">
              <ImageIcon size={15} />
            </button>
            <span className="action-divider" />
            <button className="diagram-action icon-only" type="button" onClick={resetLayout} title="Rapikan tata letak" aria-label="Rapikan tata letak">
              <WandSparkles size={15} />
            </button>
            <button className="diagram-action icon-only" type="button" onClick={() => setFullscreen((value) => !value)} title={fullscreen ? 'Keluar layar penuh' : 'Layar penuh'} aria-label={fullscreen ? 'Keluar layar penuh' : 'Layar penuh'}>
              {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>
        <div className="diagram-subbar">
          <div className="diagram-subbar-left">
            <span className="diagram-sync-pill"><span className="live-dot" /> Sinkron dengan PRD</span>
            <span className="diagram-count">{counts}</span>
          </div>
          <div className="diagram-legend">
            {tab === 'fishbone' ? (
              <>
                <span><i className="legend-line accent" /> Kategori</span>
                <span><i className="legend-line" /> Penyebab</span>
              </>
            ) : (
              <>
                <span><i className="legend-dot p0" /> P0</span>
                <span><i className="legend-dot p1" /> P1</span>
                <span><i className="legend-dot p2" /> P2</span>
                <span className="legend-tip"><PencilLine size={11} /> Edit di PRD</span>
              </>
            )}
          </div>
        </div>
        {graph}
      </section>

      {selectedFeature && tab !== 'fishbone' && (
        <div className="selected-feature-panel">
          <div className="selected-feature-main">
            <div className="selected-feature-top">
              <span className="feature-id">{selectedFeature.id}</span>
              <span className={`priority-badge priority-${selectedFeature.priority.toLowerCase()}`}>{selectedFeature.priority}</span>
              <span className="selected-feature-phase">{selectedFeature.phase}</span>
              <button className="icon-button tiny" type="button" onClick={() => setSelectedFeatureId(null)} aria-label="Tutup detail">
                <X size={14} />
              </button>
            </div>
            <h3>{selectedFeature.name}</h3>
            <p>{selectedFeature.description}</p>
            <div className="selected-feature-meta">
              <span><strong>{selectedFeature.dependencies.length}</strong> dependensi</span>
              <span><strong>{selectedFeature.acceptance.length}</strong> acceptance criteria</span>
              <span><strong>{selectedFeature.complexity}</strong> kompleksitas</span>
            </div>
            {selectedFeature.dependencies.length > 0 && (
              <div className="selected-feature-deps">
                {selectedFeature.dependencies.map((dependency) => (
                  <span key={dependency}>{dependency} · {truncate(prd.features.find((feature) => feature.id === dependency)?.name ?? 'Fitur', 22)}</span>
                ))}
              </div>
            )}
          </div>
          <button className="button ghost selected-edit-button" type="button" onClick={onOpenDocument}>
            Sunting di dokumen <ArrowUpRight size={14} />
          </button>
        </div>
      )}

      <div className="visual-notes">
        <div className="visual-note">
          <span className="visual-note-icon"><Sparkles size={15} /></span>
          <div>
            <strong>Mengapa ini penting</strong>
            <p>{note}</p>
          </div>
        </div>
        <div className="visual-note visual-note-sync">
          <span className="visual-note-icon"><Network size={15} /></span>
          <div>
            <strong>Tak ada diagram basi</strong>
            <p>Setiap perubahan pada PRD dirender ulang dari sumber yang sama.</p>
          </div>
          <button className="text-link" type="button" onClick={onOpenDocument}>
            <PencilLine size={12} /> Edit PRD
          </button>
        </div>
        <div className="visual-export-mini">
          <Download size={15} />
          <div>
            <strong>Butuh artefak?</strong>
            <p>Unduh semua diagram dari halaman ekspor.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
