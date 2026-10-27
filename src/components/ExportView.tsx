import { useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react'
import {
  ArrowUpRight,
  Braces,
  Check,
  Clipboard,
  Code2,
  Copy,
  Download,
  FileCode2,
  FileJson,
  FileText,
  Fish,
  GitBranch,
  Image as ImageIcon,
  Link2,
  Network,
  PackageCheck,
  Share2,
  Sparkles,
  Terminal,
} from 'lucide-react'
import type { DiagramTab, PRD, ToastKind } from '../types'
import { aiHandoffPack, createPdfBlob, downloadJson, downloadMarkdown, downloadPdf, prdToJson, prdToMarkdown } from '../lib/export'
import { diagramSource } from '../lib/diagrams'
import { copyText, downloadBlob, downloadSvg, downloadSvgAsPng, serializeSvg, slugify, svgToPngBlob } from '../lib/utils'
import { Flowchart } from './Flowchart'
import { Fishbone } from './Fishbone'
import { DependencyGraph } from './DependencyGraph'

const sourceTabs: Array<{ key: DiagramTab; label: string; icon: typeof GitBranch; file: string }> = [
  { key: 'flow', label: 'Flowchart', icon: GitBranch, file: 'flowchart.mmd' },
  { key: 'fishbone', label: 'Fishbone', icon: Fish, file: 'fishbone.mmd' },
  { key: 'dependencies', label: 'Dependensi', icon: Network, file: 'dependencies.mmd' },
]

export function ExportView({
  prd,
  dark,
  notify,
  onShare,
}: {
  prd: PRD
  dark: boolean
  notify: (message: string, kind?: ToastKind) => void
  onShare: () => void
}) {
  const flowRef = useRef<SVGSVGElement>(null)
  const fishRef = useRef<SVGSVGElement>(null)
  const depRef = useRef<SVGSVGElement>(null)
  const [sourceTab, setSourceTab] = useState<DiagramTab>('flow')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [bundleLoading, setBundleLoading] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const slug = slugify(prd.title)

  const markdown = useMemo(() => prdToMarkdown(prd), [prd])
  const handoff = useMemo(() => aiHandoffPack(prd), [prd])
  const sizes = useMemo(() => {
    const md = new Blob([markdown]).size
    const json = new Blob([JSON.stringify({ schema: 'adaprd/prd@1.0', document: prd }, null, 2)]).size
    const round = (bytes: number) => `${Math.max(1, Math.round(bytes / 1024))} KB`
    return { md: round(md), json: round(json) }
  }, [markdown, prd])
  const readiness = [
    { label: 'Ruang lingkup & prioritas', ready: prd.features.length > 0 },
    { label: 'Acceptance criteria', ready: prd.features.every((feature) => feature.acceptance.length > 0) },
    { label: 'Non-functional requirements', ready: prd.nonFunctional.length > 0 },
    { label: 'Tiga diagram sistem', ready: prd.features.length > 0 && prd.risks.length > 0 },
    { label: 'Rencana rilis', ready: prd.milestones.length > 0 },
  ]
  const readyCount = readiness.filter((item) => item.ready).length
  const readyPct = Math.round((readyCount / readiness.length) * 100)

  const flashCopy = (key: string) => {
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1600)
  }

  const copy = async (key: string, value: string, message: string) => {
    const success = await copyText(value)
    if (success) {
      flashCopy(key)
      notify(message, 'success')
    } else {
      notify('Gagal menyalin. Coba lagi.', 'error')
    }
  }

  const saveDiagram = (type: 'svg' | 'png', ref: RefObject<SVGSVGElement | null>, name: string) => {
    if (!ref.current) return
    if (type === 'svg') {
      downloadSvg(ref.current, `${slug}-${name}`)
      notify('SVG berhasil diunduh.', 'success')
      return
    }
    downloadSvgAsPng(ref.current, `${slug}-${name}`)
      .then(() => notify('PNG berhasil diunduh.', 'success'))
      .catch(() => notify('Gagal membuat PNG.', 'error'))
  }

  const handlePdf = async () => {
    setPdfLoading(true)
    try {
      await downloadPdf(prd)
      notify('PDF berhasil dibuat.', 'success')
    } catch {
      notify('Gagal membuat PDF. Coba lagi.', 'error')
    } finally {
      setPdfLoading(false)
    }
  }

  const diagramRows = [
    {
      key: 'flow' as DiagramTab,
      title: 'Flowchart alur inti',
      description: 'Perjalanan pengguna, keputusan, dan cabang alternatif.',
      icon: GitBranch,
      ref: flowRef,
      name: 'flowchart',
    },
    {
      key: 'fishbone' as DiagramTab,
      title: 'Ishikawa / fishbone',
      description: 'Enam kategori akar masalah dari tabel risiko.',
      icon: Fish,
      ref: fishRef,
      name: 'fishbone',
    },
    {
      key: 'dependencies' as DiagramTab,
      title: 'Dependency graph',
      description: 'Relasi antar-fitur dan urutan implementasi.',
      icon: Network,
      ref: depRef,
      name: 'dependencies',
    },
  ]

  const handleBundle = async () => {
    setBundleLoading(true)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const root = zip.folder(slug)
      if (!root) throw new Error('Folder ZIP tidak dapat dibuat.')
      root.file(`${slug}.md`, markdown)
      root.file(`${slug}.json`, prdToJson(prd))
      root.file('ai-handoff-pack.md', handoff)
      root.file(
        'README.md',
        `# ${prd.title}\n\nPaket handoff adaPRD.\n\n- \`${slug}.md\` — PRD lengkap dalam Markdown\n- \`${slug}.pdf\` — versi cetak A4\n- \`${slug}.json\` — data terstruktur\n- \`ai-handoff-pack.md\` — PRD + source diagram + instruksi agen AI\n- \`diagrams/\` — SVG, PNG, dan source Mermaid untuk tiga diagram\n`,
      )
      const diagrams = root.folder('diagrams')
      if (diagrams) {
        for (const row of diagramRows) {
          const svg = row.ref.current
          diagrams.file(`${row.name}.mmd`, diagramSource[row.key](prd))
          if (!svg) continue
          diagrams.file(`${row.name}.svg`, serializeSvg(svg))
          diagrams.file(`${row.name}.png`, await svgToPngBlob(svg))
        }
      }
      root.file(`${slug}.pdf`, await createPdfBlob(prd))
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
      downloadBlob(blob, `${slug}-handoff.zip`)
      notify('Paket handoff lengkap diunduh.', 'success')
    } catch (error) {
      console.error(error)
      notify('Gagal membuat paket ZIP. Coba lagi.', 'error')
    } finally {
      setBundleLoading(false)
    }
  }

  return (
    <div className="workspace-view export-workspace">
      <header className="export-hero">
        <div className="export-hero-copy">
          <span className="page-eyebrow"><PackageCheck size={12} /> EXPORT & HANDOFF</span>
          <h1>Kirim spec yang <em>siap dieksekusi.</em></h1>
          <p>Semua artefak dalam satu tempat. Pilih format untuk tim, atau bawa langsung ke agen AI tanpa kehilangan konteks.</p>
          <div className="export-hero-tags">
            <span><Check size={12} /> Data lokal</span>
            <span><Check size={12} /> Tanpa watermark</span>
            <span><Check size={12} /> Format standar</span>
          </div>
        </div>
        <div className="readiness-card">
          <div className="readiness-card-top">
            <span className="readiness-label">Handoff readiness</span>
            <span className="readiness-live"><span className="live-dot" /> siap</span>
          </div>
          <div className="readiness-score">
            <strong>{readyPct}<span>%</span></strong>
            <div className="mini-ring" style={{ '--score': `${readyPct * 3.6}deg` } as CSSProperties}>
              <PackageCheck size={16} />
            </div>
          </div>
          <div className="readiness-list">
            {readiness.map((item) => (
              <div className={`readiness-row ${item.ready ? 'is-ready' : ''}`} key={item.label}>
                <span className="readiness-check">{item.ready && <Check size={10} />}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="export-section">
        <div className="export-section-head">
          <div>
            <span className="export-section-index">01</span>
            <h2>Dokumen</h2>
          </div>
          <span className="export-section-meta">3 format · siap dibagikan</span>
        </div>
        <div className="document-export-grid">
          <div className="export-doc-card export-doc-primary">
            <div className="export-doc-top">
              <span className="file-type-icon md"><FileText size={19} /></span>
              <span className="format-badge">.md</span>
              <button className="icon-button tiny" type="button" title="Salin Markdown" onClick={() => copy('md', markdown, 'Markdown PRD disalin.')}>
                {copiedKey === 'md' ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>
            <div className="export-doc-copy">
              <h3>Markdown</h3>
              <p>Format bersih untuk repo, wiki, Notion, atau prompt agen AI.</p>
            </div>
            <div className="export-doc-meta"><span>{sizes.md}</span><span>UTF-8</span><span>11 bagian</span></div>
            <button className="export-download-button primary" type="button" onClick={() => { downloadMarkdown(prd); notify('Markdown diunduh.', 'success') }}>
              <Download size={15} /> Unduh .md <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="export-doc-card">
            <div className="export-doc-top">
              <span className="file-type-icon pdf"><FileCode2 size={19} /></span>
              <span className="format-badge">.pdf</span>
              <button className="icon-button tiny" type="button" onClick={handlePdf} title="Unduh PDF" aria-label="Unduh PDF">
                <Download size={13} />
              </button>
            </div>
            <div className="export-doc-copy">
              <h3>PDF</h3>
              <p>Dokumen A4 dengan cover dan tata letak siap presentasi.</p>
            </div>
            <div className="export-doc-meta"><span>A4</span><span>Cover + isi</span><span>Print-ready</span></div>
            <button className="export-download-button" type="button" onClick={handlePdf} disabled={pdfLoading}>
              {pdfLoading ? <span className="button-spinner" /> : <Download size={15} />}
              {pdfLoading ? 'Menyiapkan…' : 'Unduh PDF'} <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="export-doc-card">
            <div className="export-doc-top">
              <span className="file-type-icon json"><Braces size={19} /></span>
              <span className="format-badge">.json</span>
              <button className="icon-button tiny" type="button" title="Salin JSON" onClick={() => copy('json', JSON.stringify({ schema: 'adaprd/prd@1.0', document: prd }, null, 2), 'JSON PRD disalin.')}>
                {copiedKey === 'json' ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>
            <div className="export-doc-copy">
              <h3>JSON</h3>
              <p>Data terstruktur untuk pipeline otomatis dan integrasi internal.</p>
            </div>
            <div className="export-doc-meta"><span>{sizes.json}</span><span>Schema 1.0</span><span>Machine-readable</span></div>
            <button className="export-download-button" type="button" onClick={() => { downloadJson(prd); notify('JSON diunduh.', 'success') }}>
              <Download size={15} /> Unduh .json <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </section>

      <div className="export-mid-grid">
        <section className="asset-panel">
          <div className="export-section-head compact">
            <div>
              <span className="export-section-index">02</span>
              <h2>Aset visual</h2>
            </div>
            <span className="export-section-meta">SVG + PNG</span>
          </div>
          <div className="asset-list">
            {diagramRows.map((row) => {
              const RowIcon = row.icon
              return (
                <div className="asset-row" key={row.key}>
                  <span className="asset-icon"><RowIcon size={17} /></span>
                  <div className="asset-copy">
                    <strong>{row.title}</strong>
                    <p>{row.description}</p>
                  </div>
                  <div className="asset-actions">
                    <button className="asset-action" type="button" onClick={() => copy(`${row.key}-source`, diagramSource[row.key](prd), `Source ${row.title} disalin.`)}>
                      {copiedKey === `${row.key}-source` ? <Check size={13} /> : <Code2 size={13} />} Sumber
                    </button>
                    <button className="asset-action icon-only" type="button" onClick={() => saveDiagram('svg', row.ref, row.name)} title="Unduh SVG" aria-label={`Unduh ${row.title} SVG`}>
                      <FileCode2 size={14} />
                    </button>
                    <button className="asset-action icon-only" type="button" onClick={() => saveDiagram('png', row.ref, row.name)} title="Unduh PNG" aria-label={`Unduh ${row.title} PNG`}>
                      <ImageIcon size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="asset-note"><Sparkles size={12} /> Diagram dibuat ulang dari PRD terbaru setiap kali diunduh.</div>
        </section>

        <section className="handoff-panel">
          <div className="handoff-glow" aria-hidden="true" />
          <div className="handoff-top">
            <span className="handoff-icon"><Sparkles size={18} /></span>
            <span className="handoff-badge">Direkomendasikan</span>
          </div>
          <h2>AI handoff pack</h2>
          <p>Satu paket berisi PRD, tiga source diagram Mermaid, dan instruksi eksekusi untuk agen AI.</p>
          <div className="handoff-includes">
            <span><Check size={11} /> PRD Markdown</span>
            <span><Check size={11} /> 3 diagram</span>
            <span><Check size={11} /> Instruksi agen</span>
          </div>
          <button className="handoff-copy-button" type="button" onClick={() => copy('handoff', handoff, 'AI handoff pack disalin.')}>
            {copiedKey === 'handoff' ? <Check size={15} /> : <Clipboard size={15} />}
            {copiedKey === 'handoff' ? 'Handoff pack tersalin' : 'Salin handoff pack'}
          </button>
          <div className="handoff-secondary">
            <button type="button" onClick={() => copy('markdown', markdown, 'Markdown PRD disalin.')}><Clipboard size={13} /> PRD mentah</button>
            <button type="button" onClick={onShare}><Link2 size={13} /> Link snapshot</button>
          </div>
        </section>
      </div>

      <section className="source-section">
        <div className="export-section-head compact">
          <div>
            <span className="export-section-index">03</span>
            <h2>Source diagram</h2>
          </div>
          <span className="export-section-meta">Mermaid · siap tempel</span>
        </div>
        <div className="source-panel">
          <div className="source-panel-head">
            <div className="source-tabs" role="tablist" aria-label="Source diagram">
              {sourceTabs.map((tab) => {
                const TabIcon = tab.icon
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={sourceTab === tab.key}
                    className={sourceTab === tab.key ? 'is-active' : ''}
                    onClick={() => setSourceTab(tab.key)}
                  >
                    <TabIcon size={13} /> {tab.label}
                  </button>
                )
              })}
            </div>
            <div className="source-head-actions">
              <span className="source-filename"><Terminal size={12} /> {sourceTabs.find((tab) => tab.key === sourceTab)?.file}</span>
              <button className="button dark small" type="button" onClick={() => copy(`source-${sourceTab}`, diagramSource[sourceTab](prd), 'Source diagram disalin.')}>
                {copiedKey === `source-${sourceTab}` ? <Check size={13} /> : <Copy size={13} />}
                {copiedKey === `source-${sourceTab}` ? 'Tersalin' : 'Salin'}
              </button>
            </div>
          </div>
          <pre className="source-code"><code>{diagramSource[sourceTab](prd)}</code></pre>
        </div>
      </section>

      <div className="export-footer-actions">
        <div>
          <span className="export-footer-kicker"><FileJson size={14} /> Semua artefak dihasilkan dari satu sumber</span>
          <p>Perubahan terakhir: {new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }).format(new Date(prd.updatedAt))}</p>
        </div>
        <div className="export-footer-buttons">
          <button className="button ghost" type="button" onClick={onShare}><Share2 size={14} /> Bagikan</button>
          <button className="button primary" type="button" onClick={handleBundle} disabled={bundleLoading}>{bundleLoading ? <span className="button-spinner" /> : <Download size={14} />} {bundleLoading ? 'Menyiapkan ZIP…' : 'Unduh semua (.zip)'}</button>
        </div>
      </div>

      <div className="offscreen-diagrams" aria-hidden="true">
        <Flowchart prd={prd} svgRef={flowRef} dark={dark} staticMode />
        <Fishbone prd={prd} svgRef={fishRef} dark={dark} staticMode />
        <DependencyGraph prd={prd} svgRef={depRef} dark={dark} staticMode />
      </div>
    </div>
  )
}
