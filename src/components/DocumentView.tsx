import { useEffect, useState, type CSSProperties } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Clipboard,
  Code2,
  Database,
  GripVertical,
  Layers,
  ListChecks,
  ListTree,
  Monitor,
  Network,
  PencilLine,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Users,
  Workflow,
  X,
} from 'lucide-react'
import type { Complexity, Feature, PRD, Persona, Priority, ToastKind, View } from '../types'
import { EditableList, EditableText, PrioritySelect } from './Editable'
import { formatDate, readingTime, truncate } from '../lib/utils'
import { copyText } from '../lib/utils'
import { prdToMarkdown } from '../lib/export'

type UpdatePRD = (updater: (current: PRD) => PRD) => void

const complexityOptions: Complexity[] = ['Rendah', 'Sedang', 'Tinggi']
const initialPersonaColors = ['#f9d5c7', '#d9e3ce', '#d8d7ef', '#f4e0b8', '#cfe2e9']

function nextId(prefix: string, ids: string[]): string {
  const numbers = ids
    .map((id) => Number(id.split('-')[1]))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b)
  const next = (numbers[numbers.length - 1] ?? 0) + 1
  return `${prefix}-${String(next).padStart(2, '0')}`
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AP'
}

function SectionHeading({
  number,
  title,
  onChange,
}: {
  number: string
  title: string
  onChange: (value: string) => void
}) {
  return (
    <div className="section-heading">
      <span className="section-number">{number}</span>
      <EditableText as="h2" className="section-title" value={title} onChange={onChange} ariaLabel={`Judul bagian ${number}`} />
      <span className="section-rule" />
    </div>
  )
}

function ChipEditor({
  items,
  onChange,
  tone = 'default',
  addLabel,
}: {
  items: string[]
  onChange: (items: string[]) => void
  tone?: 'default' | 'accent'
  addLabel: string
}) {
  return (
    <div className={`chip-editor chip-editor-${tone}`}>
      {items.map((item, index) => (
        <span className="edit-chip" key={index}>
          <EditableText
            as="span"
            value={item}
            onChange={(value) => {
              const next = [...items]
              next[index] = value
              onChange(next)
            }}
            className="edit-chip-text"
            placeholder="Tulis…"
            ariaLabel={`Item ${index + 1}`}
          />
          <button type="button" className="edit-chip-remove" onClick={() => onChange(items.filter((_, i) => i !== index))} title="Hapus">
            <X size={11} />
          </button>
        </span>
      ))}
      <button type="button" className="add-chip" onClick={() => onChange([...items, ''])}>
        <Plus size={12} /> {addLabel}
      </button>
    </div>
  )
}

function FeatureCard({
  feature,
  allFeatures,
  index,
  onUpdate,
  onDelete,
}: {
  feature: Feature
  allFeatures: Feature[]
  index: number
  onUpdate: (patch: Partial<Feature>) => void
  onDelete: () => void
}) {
  const [showDeps, setShowDeps] = useState(false)
  const featureMap = new Map(allFeatures.map((item) => [item.id, item]))
  const availableDependencies = allFeatures.filter((item) => item.id !== feature.id && !feature.dependencies.includes(item.id))
  return (
    <article className={`feature-card feature-${feature.priority.toLowerCase()}`}>
      <div className="feature-card-head">
        <div className="feature-identity">
          <span className="feature-drag" aria-hidden="true"><GripVertical size={14} /></span>
          <span className="feature-id">{feature.id}</span>
          <EditableText
            as="h3"
            className="feature-name"
            value={feature.name}
            onChange={(name) => onUpdate({ name })}
            placeholder="Nama fitur"
            ariaLabel={`Nama fitur ${feature.id}`}
          />
        </div>
        <button className="icon-button tiny row-delete" type="button" onClick={onDelete} title="Hapus fitur">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="feature-meta-row">
        <PrioritySelect value={feature.priority} onChange={(priority) => onUpdate({ priority })} compact />
        <label className="meta-select-wrap">
          <span className="meta-label">Kompleksitas</span>
          <select className="meta-select" value={feature.complexity} onChange={(event) => onUpdate({ complexity: event.target.value as Complexity })}>
            {complexityOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label className="meta-select-wrap phase-select">
          <span className="meta-label">Fase</span>
          <select className="meta-select" value={feature.phase} onChange={(event) => onUpdate({ phase: event.target.value })}>
            {Array.from(new Set([feature.phase, 'Fase 1 · Fondasi', 'Fase 2 · Alur inti', 'Fase 3 · Skala'])).map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <span className="feature-sequence">#{String(index + 1).padStart(2, '0')}</span>
      </div>
      <EditableText
        value={feature.description}
        onChange={(description) => onUpdate({ description })}
        className="feature-description"
        placeholder="Jelaskan nilai dan perilaku fitur…"
        ariaLabel={`Deskripsi ${feature.name}`}
        multiline
      />
      <div className="acceptance-block">
        <div className="mini-label"><Check size={12} /> Acceptance criteria</div>
        <EditableList
          items={feature.acceptance}
          onChange={(acceptance) => onUpdate({ acceptance })}
          addLabel="Tambah kriteria"
          compact
        />
      </div>
      <div className="dependency-block">
        <button className="mini-label dependency-toggle" type="button" onClick={() => setShowDeps((value) => !value)}>
          <Network size={12} /> Dependensi
          <span className="dependency-count">{feature.dependencies.length}</span>
          <ChevronDown size={12} className={showDeps ? 'is-rotated' : ''} />
        </button>
        {(showDeps || feature.dependencies.length > 0) && (
          <div className="dependency-content">
            {feature.dependencies.map((dependency) => (
              <span className="dependency-chip" key={dependency}>
                <span>{dependency} · {truncate(featureMap.get(dependency)?.name ?? 'Fitur terhapus', 22)}</span>
                <button type="button" onClick={() => onUpdate({ dependencies: feature.dependencies.filter((id) => id !== dependency) })} aria-label="Hapus dependensi">
                  <X size={11} />
                </button>
              </span>
            ))}
            {availableDependencies.length > 0 && (
              <select
                className="dependency-add"
                value=""
                aria-label="Tambah dependensi"
                onChange={(event) => {
                  if (event.target.value) onUpdate({ dependencies: [...feature.dependencies, event.target.value] })
                }}
              >
                <option value="">+ Tambah dependensi</option>
                {availableDependencies.map((item) => (
                  <option key={item.id} value={item.id}>{item.id} · {item.name}</option>
                ))}
              </select>
            )}
            {feature.dependencies.length === 0 && availableDependencies.length === 0 && (
              <span className="dependency-empty">Belum ada dependensi.</span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function MetricEditor({
  prd,
  update,
}: {
  prd: PRD
  update: UpdatePRD
}) {
  return (
    <div className="metric-grid">
      {prd.metrics.map((metric, index) => (
        <div className="metric-card" key={index}>
          <div className="metric-head">
            <span className="metric-index">M{String(index + 1).padStart(2, '0')}</span>
            <button className="icon-button tiny row-delete" type="button" title="Hapus metrik" onClick={() => update((current) => ({ ...current, metrics: current.metrics.filter((_, i) => i !== index) }))}>
              <X size={12} />
            </button>
          </div>
          <EditableText
            as="h4"
            className="metric-name"
            value={metric.name}
            onChange={(name) => update((current) => ({ ...current, metrics: current.metrics.map((item, i) => i === index ? { ...item, name } : item) }))}
            placeholder="Nama metrik"
          />
          <EditableText
            as="div"
            className="metric-target"
            value={metric.target}
            onChange={(target) => update((current) => ({ ...current, metrics: current.metrics.map((item, i) => i === index ? { ...item, target } : item) }))}
            placeholder="Target"
          />
          <EditableText
            as="p"
            className="metric-description"
            value={metric.description}
            onChange={(description) => update((current) => ({ ...current, metrics: current.metrics.map((item, i) => i === index ? { ...item, description } : item) }))}
            placeholder="Cara mengukur"
            multiline
          />
        </div>
      ))}
      <button className="metric-add" type="button" onClick={() => update((current) => ({ ...current, metrics: [...current.metrics, { name: 'Metrik baru', target: 'Target', description: 'Definisi pengukuran.' }] }))}>
        <Plus size={15} /> Tambah metrik
      </button>
    </div>
  )
}

export function DocumentView({
  prd,
  onChange,
  notify,
  onOpenVisuals,
}: {
  prd: PRD
  onChange: UpdatePRD
  notify: (message: string, kind?: ToastKind) => void
  onOpenVisuals: (view: View) => void
}) {
  const [activeSection, setActiveSection] = useState('summary')
  const [copied, setCopied] = useState(false)

  const sectionLabel = (key: string, fallback: string) => prd.sectionTitles?.[key] || fallback
  const update = onChange

  const outlineItems = [
    { key: 'summary', number: '01', title: sectionLabel('summary', 'Ringkasan Eksekutif') },
    { key: 'goals', number: '02', title: sectionLabel('goals', 'Tujuan & Metrik') },
    { key: 'personas', number: '03', title: sectionLabel('personas', 'Persona & Pengguna') },
    { key: 'features', number: '04', title: sectionLabel('features', 'Lingkup Fitur') },
    { key: 'stories', number: '05', title: sectionLabel('stories', 'User Stories') },
    { key: 'functional', number: '06', title: sectionLabel('functional', 'Kebutuhan Fungsional') },
    { key: 'nonFunctional', number: '07', title: sectionLabel('nonFunctional', 'Kebutuhan Non-Fungsional') },
    { key: 'tech', number: '08', title: sectionLabel('tech', 'Arsitektur & Parameter Teknis') },
    { key: 'risks', number: '09', title: sectionLabel('risks', 'Risiko & Asumsi') },
    { key: 'milestones', number: '10', title: sectionLabel('milestones', 'Rencana Rilis') },
    { key: 'openQuestions', number: '11', title: sectionLabel('openQuestions', 'Pertanyaan Terbuka') },
    ...prd.customSections.map((section, index) => ({ key: `custom-${section.id}`, number: String(12 + index).padStart(2, '0'), title: section.title || 'Bagian tambahan' })),
  ]

  const readinessChecks = [
    prd.executiveSummary.length > 80,
    prd.problem.length > 50,
    prd.goals.length > 0,
    prd.metrics.length > 0,
    prd.personas.length > 0,
    prd.features.length > 0 && prd.features.every((feature) => feature.acceptance.length > 0),
    prd.userStories.length > 0,
    prd.functional.length > 0,
    prd.nonFunctional.length > 0,
    prd.tech.stack.length > 0 && prd.tech.endpoints.length > 0,
    prd.risks.length > 0,
    prd.milestones.length > 0,
  ]
  const readiness = Math.round((readinessChecks.filter(Boolean).length / readinessChecks.length) * 100)
  const words = `${prd.executiveSummary} ${prd.problem} ${prd.solution} ${prd.features.map((f) => `${f.description} ${f.acceptance.join(' ')}`).join(' ')}`
    .split(/\s+/)
    .filter(Boolean).length

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-doc-section]'))
    if (!sections.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) {
          const id = visible[0].target.getAttribute('data-doc-section')
          if (id) setActiveSection(id)
        }
      },
      { rootMargin: '-120px 0px -58% 0px', threshold: [0, 0.1, 0.4] },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [prd.customSections.length])

  const goToSection = (key: string) => {
    setActiveSection(key)
    document.getElementById(`doc-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const copyMarkdown = async () => {
    const success = await copyText(prdToMarkdown(prd))
    if (success) {
      setCopied(true)
      notify('Markdown PRD disalin.', 'success')
      setTimeout(() => setCopied(false), 1600)
    } else {
      notify('Gagal menyalin dokumen.', 'error')
    }
  }

  const updateSectionTitle = (key: string, value: string) => {
    update((current) => ({ ...current, sectionTitles: { ...current.sectionTitles, [key]: value } }))
  }

  const updateFeature = (id: string, patch: Partial<Feature>) => {
    update((current) => ({
      ...current,
      features: current.features.map((feature) => feature.id === id ? { ...feature, ...patch } : feature),
    }))
  }

  const deleteFeature = (id: string) => {
    update((current) => ({
      ...current,
      features: current.features
        .filter((feature) => feature.id !== id)
        .map((feature) => ({ ...feature, dependencies: feature.dependencies.filter((dep) => dep !== id) })),
      userStories: current.userStories,
      functional: current.functional.filter((item) => item.title !== current.features.find((f) => f.id === id)?.name),
    }))
    notify('Fitur dihapus. Peta dependensi diperbarui.', 'info')
  }

  const addFeature = () => {
    update((current) => {
      const id = nextId('F', current.features.map((feature) => feature.id))
      const newFeature: Feature = {
        id,
        name: 'Fitur baru',
        description: 'Jelaskan nilai, perilaku, dan batas fitur ini.',
        priority: 'P1',
        complexity: 'Sedang',
        phase: 'Fase 3 · Skala',
        dependencies: [],
        acceptance: ['Kriteria keberhasilan pertama.'],
      }
      return { ...current, features: [...current.features, newFeature] }
    })
    notify('Fitur baru ditambahkan.', 'success')
  }

  const addCustomSection = () => {
    const id = Math.random().toString(36).slice(2, 8)
    update((current) => ({
      ...current,
      customSections: [...current.customSections, { id, title: 'Bagian baru', content: 'Tulis konteks tambahan di sini.' }],
    }))
    setTimeout(() => document.getElementById(`doc-custom-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  return (
    <div className="workspace-view document-workspace">
      <div className="document-layout">
        <aside className="document-outline">
          <div className="outline-sticky">
            <div className="outline-top">
              <span className="outline-label"><ListTree size={14} /> Daftar isi</span>
              <span className="outline-count">{outlineItems.length}</span>
            </div>
            <nav className="outline-nav" aria-label="Daftar isi dokumen">
              {outlineItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`outline-item ${activeSection === item.key ? 'is-active' : ''}`}
                  onClick={() => goToSection(item.key)}
                >
                  <span className="outline-number">{item.number}</span>
                  <span>{truncate(item.title, 34)}</span>
                </button>
              ))}
            </nav>
            <div className="outline-card">
              <div className="readiness-head">
                <div className="readiness-ring" style={{ '--score': `${readiness * 3.6}deg` } as CSSProperties}>
                  <span>{readiness}</span>
                </div>
                <div>
                  <strong>{readiness >= 90 ? 'Siap direview' : readiness >= 65 ? 'Hampir siap' : 'Perlu dilengkapi'}</strong>
                  <p>{words.toLocaleString('id-ID')} kata · {outlineItems.length} bagian</p>
                </div>
              </div>
              <div className="readiness-track"><span style={{ width: `${readiness}%` }} /></div>
              <div className="outline-meta-row">
                <span><PencilLine size={11} /> Sunting langsung</span>
                <span><Sparkles size={11} /> Auto-save</span>
              </div>
              <button className="outline-copy-button" type="button" onClick={copyMarkdown}>
                {copied ? <Check size={14} /> : <Clipboard size={14} />}
                {copied ? 'Markdown tersalin' : 'Salin Markdown'}
              </button>
              <button className="outline-visual-button" type="button" onClick={() => onOpenVisuals('visuals')}>
                <Network size={14} /> Buka peta visual <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        </aside>

        <article className="doc-paper">
          <header className="doc-cover">
            <div className="cover-top">
              <span className="doc-kicker"><span className="kicker-mark">P</span> PRODUCT REQUIREMENTS DOCUMENT</span>
              <span className="cover-version">v1.0 · {formatDate(prd.createdAt)}</span>
            </div>
            <div className="cover-main">
              <div className="cover-title-wrap">
                <span className="cover-code">PRD / {prd.id.slice(-6).toUpperCase()}</span>
                <EditableText
                  as="h1"
                  className="doc-title"
                  value={prd.title}
                  onChange={(title) => update((current) => ({ ...current, title }))}
                  placeholder="Judul produk"
                  ariaLabel="Judul PRD"
                />
                <EditableText
                  as="p"
                  className="doc-tagline"
                  value={prd.tagline}
                  onChange={(tagline) => update((current) => ({ ...current, tagline }))}
                  placeholder="Tagline produk"
                  ariaLabel="Tagline PRD"
                />
              </div>
              <div className="cover-status">
                <span className="status-caption">Status dokumen</span>
                <div className={`status-select status-${prd.status.toLowerCase()}`}>
                  <span className="status-dot" />
                  <select value={prd.status} onChange={(event) => update((current) => ({ ...current, status: event.target.value as PRD['status'] }))}>
                    <option value="Draft">Draft</option>
                    <option value="Review">Review</option>
                    <option value="Final">Final</option>
                  </select>
                  <ChevronDown size={13} />
                </div>
                <span className="cover-editing"><PencilLine size={12} /> Inline editing aktif</span>
              </div>
            </div>
            <div className="doc-meta-grid">
              <div className="doc-meta-item">
                <span className="doc-meta-icon"><Users size={15} /></span>
                <div>
                  <span className="doc-meta-label">Target pengguna</span>
                  <EditableText value={prd.audience} onChange={(audience) => update((current) => ({ ...current, audience }))} className="doc-meta-value" placeholder="Target pengguna" />
                </div>
              </div>
              <div className="doc-meta-item">
                <span className="doc-meta-icon"><Monitor size={15} /></span>
                <div>
                  <span className="doc-meta-label">Platform</span>
                  <EditableText value={prd.platform} onChange={(platform) => update((current) => ({ ...current, platform }))} className="doc-meta-value" placeholder="Platform" />
                </div>
              </div>
              <div className="doc-meta-item">
                <span className="doc-meta-icon"><CalendarDays size={15} /></span>
                <div>
                  <span className="doc-meta-label">Timeline</span>
                  <EditableText value={prd.timeline} onChange={(timeline) => update((current) => ({ ...current, timeline }))} className="doc-meta-value" placeholder="Timeline" />
                </div>
              </div>
              <div className="doc-meta-item">
                <span className="doc-meta-icon"><Layers size={15} /></span>
                <div>
                  <span className="doc-meta-label">Tim</span>
                  <EditableText value={prd.team} onChange={(team) => update((current) => ({ ...current, team }))} className="doc-meta-value" placeholder="Komposisi tim" />
                </div>
              </div>
            </div>
            <details className="brief-details">
              <summary><span><CircleHelp size={13} /> Brief asli</span><ChevronDown size={13} /></summary>
              <p>{prd.prompt}</p>
            </details>
          </header>

          <div className="doc-sections">
            <section className="doc-section" id="doc-summary" data-doc-section="summary">
              <SectionHeading number="01" title={sectionLabel('summary', 'Ringkasan Eksekutif')} onChange={(value) => updateSectionTitle('summary', value)} />
              <EditableText
                value={prd.executiveSummary}
                onChange={(executiveSummary) => update((current) => ({ ...current, executiveSummary }))}
                className="summary-lead"
                placeholder="Ringkasan eksekutif…"
                multiline
              />
              <div className="summary-split">
                <div className="summary-card summary-problem">
                  <div className="summary-card-icon"><AlertTriangle size={16} /></div>
                  <span className="mini-label">Masalah</span>
                  <EditableText
                    value={prd.problem}
                    onChange={(problem) => update((current) => ({ ...current, problem }))}
                    className="summary-card-text"
                    placeholder="Masalah yang diselesaikan…"
                    multiline
                  />
                </div>
                <div className="summary-card summary-solution">
                  <div className="summary-card-icon"><Sparkles size={16} /></div>
                  <span className="mini-label">Pendekatan</span>
                  <EditableText
                    value={prd.solution}
                    onChange={(solution) => update((current) => ({ ...current, solution }))}
                    className="summary-card-text"
                    placeholder="Solusi dan pendekatan…"
                    multiline
                  />
                </div>
              </div>
            </section>

            <section className="doc-section" id="doc-goals" data-doc-section="goals">
              <SectionHeading number="02" title={sectionLabel('goals', 'Tujuan & Metrik')} onChange={(value) => updateSectionTitle('goals', value)} />
              <div className="goal-layout">
                <div className="goal-panel">
                  <div className="panel-heading"><Target size={15} /><span>Tujuan utama</span></div>
                  <EditableList
                    items={prd.goals}
                    onChange={(goals) => update((current) => ({ ...current, goals }))}
                    addLabel="Tambah tujuan"
                    numbered
                  />
                </div>
                <div className="goal-context">
                  <span className="goal-context-label">DEFINISI SUKSES</span>
                  <p className="goal-context-copy">Produk berhasil ketika tim dapat membuktikan nilai inti lewat metrik yang terukur — bukan sekadar menambah aktivitas.</p>
                  <span className="goal-context-index">01—{String(prd.metrics.length).padStart(2, '0')}</span>
                </div>
              </div>
              <MetricEditor prd={prd} update={update} />
            </section>

            <section className="doc-section" id="doc-personas" data-doc-section="personas">
              <SectionHeading number="03" title={sectionLabel('personas', 'Persona & Pengguna')} onChange={(value) => updateSectionTitle('personas', value)} />
              <p className="section-intro">Konteks manusia di balik setiap keputusan produk.</p>
              <div className="persona-grid">
                {prd.personas.map((persona, index) => (
                  <div className="persona-card" key={persona.id}>
                    <div className="persona-top">
                      <div className="persona-avatar" style={{ background: initialPersonaColors[index % initialPersonaColors.length] }}>{initials(persona.name)}</div>
                      <div className="persona-main">
                        <EditableText
                          as="h3"
                          value={persona.name}
                          onChange={(name) => update((current) => ({ ...current, personas: current.personas.map((p) => p.id === persona.id ? { ...p, name } : p) }))}
                          className="persona-name"
                          placeholder="Nama persona"
                        />
                        <EditableText
                          as="p"
                          value={persona.role}
                          onChange={(role) => update((current) => ({ ...current, personas: current.personas.map((p) => p.id === persona.id ? { ...p, role } : p) }))}
                          className="persona-role"
                          placeholder="Peran"
                        />
                      </div>
                      <button className="icon-button tiny row-delete" type="button" title="Hapus persona" onClick={() => update((current) => ({ ...current, personas: current.personas.filter((p) => p.id !== persona.id) }))}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <EditableText
                      as="blockquote"
                      value={persona.quote}
                      onChange={(quote) => update((current) => ({ ...current, personas: current.personas.map((p) => p.id === persona.id ? { ...p, quote } : p) }))}
                      className="persona-quote"
                      placeholder="Kutipan persona…"
                      multiline
                    />
                    <div className="persona-detail">
                      <span className="persona-detail-label">Pain</span>
                      <EditableText
                        value={persona.pain}
                        onChange={(pain) => update((current) => ({ ...current, personas: current.personas.map((p) => p.id === persona.id ? { ...p, pain } : p) }))}
                        className="persona-detail-text"
                        placeholder="Pain point"
                        multiline
                      />
                    </div>
                    <div className="persona-detail">
                      <span className="persona-detail-label">Goal</span>
                      <EditableText
                        value={persona.goal}
                        onChange={(goal) => update((current) => ({ ...current, personas: current.personas.map((p) => p.id === persona.id ? { ...p, goal } : p) }))}
                        className="persona-detail-text"
                        placeholder="Tujuan persona"
                        multiline
                      />
                    </div>
                  </div>
                ))}
                <button className="add-persona-card" type="button" onClick={() => update((current) => ({ ...current, personas: [...current.personas, { id: `persona-${Date.now()}`, name: 'Persona baru', role: 'Peran', quote: 'Kutipan pengguna.', pain: 'Pain point utama.', goal: 'Tujuan yang ingin dicapai.' }] }))}>
                  <Plus size={18} />
                  <span>Tambah persona</span>
                </button>
              </div>
            </section>

            <section className="doc-section" id="doc-features" data-doc-section="features">
              <SectionHeading number="04" title={sectionLabel('features', 'Lingkup Fitur')} onChange={(value) => updateSectionTitle('features', value)} />
              <div className="section-subheader">
                <p className="section-intro">Prioritas, dependensi, dan acceptance criteria yang dapat langsung dieksekusi.</p>
                <div className="feature-stats">
                  <span><span className="priority-static p0">P0</span>{prd.features.filter((f) => f.priority === 'P0').length}</span>
                  <span>{prd.features.length} fitur</span>
                </div>
              </div>
              <div className="feature-list">
                {prd.features.map((feature, index) => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    allFeatures={prd.features}
                    index={index}
                    onUpdate={(patch) => updateFeature(feature.id, patch)}
                    onDelete={() => deleteFeature(feature.id)}
                  />
                ))}
              </div>
              <button className="add-block-button" type="button" onClick={addFeature}>
                <Plus size={15} /> Tambah fitur
              </button>
            </section>

            <section className="doc-section" id="doc-stories" data-doc-section="stories">
              <SectionHeading number="05" title={sectionLabel('stories', 'User Stories')} onChange={(value) => updateSectionTitle('stories', value)} />
              <p className="section-intro">Satu pernyataan yang menghubungkan kebutuhan pengguna dengan perilaku produk.</p>
              <div className="story-list">
                {prd.userStories.map((story, index) => (
                  <div className="story-card" key={story.id}>
                    <div className="story-topline">
                      <span className="story-id">{story.id}</span>
                      <PrioritySelect
                        value={story.priority}
                        onChange={(priority) => update((current) => ({ ...current, userStories: current.userStories.map((item, i) => i === index ? { ...item, priority } : item) }))}
                        compact
                      />
                      <button className="icon-button tiny row-delete" type="button" title="Hapus user story" onClick={() => update((current) => ({ ...current, userStories: current.userStories.filter((_, i) => i !== index) }))}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="story-sentence">
                      Sebagai{' '}
                      <EditableText
                        as="span"
                        className="story-inline story-role"
                        value={story.role}
                        onChange={(role) => update((current) => ({ ...current, userStories: current.userStories.map((item, i) => i === index ? { ...item, role } : item) }))}
                        placeholder="peran"
                      />
                      , saya ingin{' '}
                      <EditableText
                        as="span"
                        className="story-inline"
                        value={story.action}
                        onChange={(action) => update((current) => ({ ...current, userStories: current.userStories.map((item, i) => i === index ? { ...item, action } : item) }))}
                        placeholder="tindakan"
                      />
                      , agar{' '}
                      <EditableText
                        as="span"
                        className="story-inline"
                        value={story.outcome}
                        onChange={(outcome) => update((current) => ({ ...current, userStories: current.userStories.map((item, i) => i === index ? { ...item, outcome } : item) }))}
                        placeholder="manfaat"
                      />
                      .
                    </p>
                  </div>
                ))}
                <button className="add-block-button" type="button" onClick={() => update((current) => ({ ...current, userStories: [...current.userStories, { id: nextId('US', current.userStories.map((s) => s.id)), persona: 'Pengguna', role: 'pengguna', action: 'menyelesaikan alur inti', outcome: 'pekerjaan menjadi lebih ringan', priority: 'P1' }] }))}>
                  <Plus size={15} /> Tambah user story
                </button>
              </div>
            </section>

            <section className="doc-section" id="doc-functional" data-doc-section="functional">
              <SectionHeading number="06" title={sectionLabel('functional', 'Kebutuhan Fungsional')} onChange={(value) => updateSectionTitle('functional', value)} />
              <div className="requirement-list">
                {prd.functional.map((requirement, index) => (
                  <div className="requirement-row" key={requirement.id}>
                    <span className="requirement-id">{requirement.id}</span>
                    <div className="requirement-main">
                      <EditableText
                        as="h3"
                        className="requirement-title"
                        value={requirement.title}
                        onChange={(title) => update((current) => ({ ...current, functional: current.functional.map((item, i) => i === index ? { ...item, title } : item) }))}
                        placeholder="Judul requirement"
                      />
                      <EditableText
                        as="p"
                        className="requirement-detail"
                        value={requirement.detail}
                        onChange={(detail) => update((current) => ({ ...current, functional: current.functional.map((item, i) => i === index ? { ...item, detail } : item) }))}
                        placeholder="Detail requirement…"
                        multiline
                      />
                    </div>
                    <PrioritySelect
                      value={requirement.priority}
                      onChange={(priority) => update((current) => ({ ...current, functional: current.functional.map((item, i) => i === index ? { ...item, priority } : item) }))}
                      compact
                    />
                    <button className="icon-button tiny row-delete" type="button" title="Hapus requirement" onClick={() => update((current) => ({ ...current, functional: current.functional.filter((_, i) => i !== index) }))}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <button className="add-block-button" type="button" onClick={() => update((current) => ({ ...current, functional: [...current.functional, { id: nextId('FR', current.functional.map((item) => item.id)), title: 'Requirement baru', detail: 'Jelaskan perilaku sistem yang harus terjadi.', priority: 'P1' }] }))}>
                  <Plus size={15} /> Tambah requirement
                </button>
              </div>
            </section>

            <section className="doc-section" id="doc-nonFunctional" data-doc-section="nonFunctional">
              <SectionHeading number="07" title={sectionLabel('nonFunctional', 'Kebutuhan Non-Fungsional')} onChange={(value) => updateSectionTitle('nonFunctional', value)} />
              <p className="section-intro">Batas kualitas yang membuat sistem aman, cepat, dan layak dipercaya.</p>
              <div className="nfr-grid">
                {prd.nonFunctional.map((requirement, index) => (
                  <div className="nfr-card" key={requirement.id}>
                    <div className="nfr-top">
                      <span className="nfr-icon"><ShieldCheck size={14} /></span>
                      <EditableText
                        value={requirement.category}
                        onChange={(category) => update((current) => ({ ...current, nonFunctional: current.nonFunctional.map((item, i) => i === index ? { ...item, category } : item) }))}
                        className="nfr-category"
                        placeholder="Kategori"
                      />
                      <button className="icon-button tiny row-delete" type="button" title="Hapus" onClick={() => update((current) => ({ ...current, nonFunctional: current.nonFunctional.filter((_, i) => i !== index) }))}>
                        <X size={12} />
                      </button>
                    </div>
                    <EditableText
                      value={requirement.target}
                      onChange={(target) => update((current) => ({ ...current, nonFunctional: current.nonFunctional.map((item, i) => i === index ? { ...item, target } : item) }))}
                      className="nfr-target"
                      placeholder="Target terukur"
                    />
                    <EditableText
                      value={requirement.detail}
                      onChange={(detail) => update((current) => ({ ...current, nonFunctional: current.nonFunctional.map((item, i) => i === index ? { ...item, detail } : item) }))}
                      className="nfr-detail"
                      placeholder="Detail implementasi"
                      multiline
                    />
                  </div>
                ))}
                <button className="add-persona-card nfr-add" type="button" onClick={() => update((current) => ({ ...current, nonFunctional: [...current.nonFunctional, { id: nextId('NFR', current.nonFunctional.map((item) => item.id)), category: 'Kategori', target: 'Target', detail: 'Detail kebutuhan.' }] }))}>
                  <Plus size={18} />
                  <span>Tambah kebutuhan</span>
                </button>
              </div>
            </section>

            <section className="doc-section" id="doc-tech" data-doc-section="tech">
              <SectionHeading number="08" title={sectionLabel('tech', 'Arsitektur & Parameter Teknis')} onChange={(value) => updateSectionTitle('tech', value)} />
              <div className="architecture-card">
                <div className="architecture-head"><Code2 size={15} /><span>Pendekatan arsitektur</span></div>
                <EditableText
                  value={prd.tech.architecture}
                  onChange={(architecture) => update((current) => ({ ...current, tech: { ...current.tech, architecture } }))}
                  className="architecture-copy"
                  placeholder="Jelaskan pendekatan arsitektur…"
                  multiline
                />
              </div>
              <div className="tech-stack-grid">
                <div className="tech-panel">
                  <div className="panel-heading"><Layers size={14} /><span>Stack</span></div>
                  <ChipEditor
                    items={prd.tech.stack}
                    onChange={(stack) => update((current) => ({ ...current, tech: { ...current.tech, stack } }))}
                    addLabel="Tambah"
                  />
                </div>
                <div className="tech-panel">
                  <div className="panel-heading"><Workflow size={14} /><span>Integrasi</span></div>
                  <ChipEditor
                    items={prd.tech.integrations}
                    onChange={(integrations) => update((current) => ({ ...current, tech: { ...current.tech, integrations } }))}
                    tone="accent"
                    addLabel="Tambah"
                  />
                </div>
              </div>
              <div className="tech-subsection">
                <div className="panel-heading"><Database size={14} /><span>Entitas data</span></div>
                <div className="entity-list">
                  {prd.tech.entities.map((entity, index) => (
                    <div className="entity-row" key={index}>
                      <EditableText
                        value={entity.name}
                        onChange={(name) => update((current) => ({ ...current, tech: { ...current.tech, entities: current.tech.entities.map((item, i) => i === index ? { ...item, name } : item) } }))}
                        className="entity-name"
                        placeholder="Nama entitas"
                      />
                      <EditableText
                        value={entity.fields}
                        onChange={(fields) => update((current) => ({ ...current, tech: { ...current.tech, entities: current.tech.entities.map((item, i) => i === index ? { ...item, fields } : item) } }))}
                        className="entity-fields"
                        placeholder="field_1, field_2, …"
                        multiline
                      />
                      <button className="icon-button tiny row-delete" type="button" title="Hapus entitas" onClick={() => update((current) => ({ ...current, tech: { ...current.tech, entities: current.tech.entities.filter((_, i) => i !== index) } }))}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button className="add-inline-button" type="button" onClick={() => update((current) => ({ ...current, tech: { ...current.tech, entities: [...current.tech.entities, { name: 'Entitas', fields: 'id, created_at' }] } }))}>
                    <Plus size={13} /> Tambah entitas
                  </button>
                </div>
              </div>
              <div className="tech-subsection">
                <div className="panel-heading"><Network size={14} /><span>Endpoint utama</span><span className="panel-count">{prd.tech.endpoints.length}</span></div>
                <div className="endpoint-list">
                  {prd.tech.endpoints.map((endpoint, index) => (
                    <div className="endpoint-row" key={index}>
                      <select
                        className={`method-select method-${endpoint.method.toLowerCase()}`}
                        value={endpoint.method}
                        onChange={(event) => update((current) => ({ ...current, tech: { ...current.tech, endpoints: current.tech.endpoints.map((item, i) => i === index ? { ...item, method: event.target.value } : item) } }))}
                      >
                        {['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].map((method) => <option key={method}>{method}</option>)}
                      </select>
                      <EditableText
                        value={endpoint.path}
                        onChange={(path) => update((current) => ({ ...current, tech: { ...current.tech, endpoints: current.tech.endpoints.map((item, i) => i === index ? { ...item, path } : item) } }))}
                        className="endpoint-path"
                        placeholder="/v1/resource"
                      />
                      <EditableText
                        value={endpoint.purpose}
                        onChange={(purpose) => update((current) => ({ ...current, tech: { ...current.tech, endpoints: current.tech.endpoints.map((item, i) => i === index ? { ...item, purpose } : item) } }))}
                        className="endpoint-purpose"
                        placeholder="Tujuan endpoint"
                        multiline
                      />
                      <button className="icon-button tiny row-delete" type="button" title="Hapus endpoint" onClick={() => update((current) => ({ ...current, tech: { ...current.tech, endpoints: current.tech.endpoints.filter((_, i) => i !== index) } }))}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button className="add-inline-button" type="button" onClick={() => update((current) => ({ ...current, tech: { ...current.tech, endpoints: [...current.tech.endpoints, { method: 'GET', path: '/v1/resource', purpose: 'Menjelaskan tujuan endpoint.' }] } }))}>
                    <Plus size={13} /> Tambah endpoint
                  </button>
                </div>
              </div>
            </section>

            <section className="doc-section" id="doc-risks" data-doc-section="risks">
              <SectionHeading number="09" title={sectionLabel('risks', 'Risiko & Asumsi')} onChange={(value) => updateSectionTitle('risks', value)} />
              <div className="risk-header-row">
                <p className="section-intro">Kategori dan penyebab di bawah ini menjadi sumber fishbone diagram.</p>
                <span className="sync-badge"><Network size={12} /> Sinkron ke fishbone</span>
              </div>
              <div className="risk-list">
                {prd.risks.map((risk, index) => (
                  <div className="risk-card" key={risk.id}>
                    <div className="risk-topline">
                      <span className="risk-id">{risk.id}</span>
                      <div className="risk-category-wrap">
                        <AlertTriangle size={12} />
                        <EditableText
                          value={risk.category}
                          onChange={(category) => update((current) => ({ ...current, risks: current.risks.map((item, i) => i === index ? { ...item, category } : item) }))}
                          className="risk-category"
                          placeholder="Kategori"
                        />
                      </div>
                      <button className="icon-button tiny row-delete" type="button" title="Hapus risiko" onClick={() => update((current) => ({ ...current, risks: current.risks.filter((_, i) => i !== index) }))}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="risk-grid">
                      <div className="risk-field">
                        <span className="mini-label">Penyebab</span>
                        <EditableText
                          value={risk.cause}
                          onChange={(cause) => update((current) => ({ ...current, risks: current.risks.map((item, i) => i === index ? { ...item, cause } : item) }))}
                          className="risk-text"
                          placeholder="Penyebab risiko…"
                          multiline
                        />
                      </div>
                      <div className="risk-field">
                        <span className="mini-label">Dampak</span>
                        <EditableText
                          value={risk.impact}
                          onChange={(impact) => update((current) => ({ ...current, risks: current.risks.map((item, i) => i === index ? { ...item, impact } : item) }))}
                          className="risk-text"
                          placeholder="Dampak bila terjadi…"
                          multiline
                        />
                      </div>
                      <div className="risk-field">
                        <span className="mini-label">Mitigasi</span>
                        <EditableText
                          value={risk.mitigation}
                          onChange={(mitigation) => update((current) => ({ ...current, risks: current.risks.map((item, i) => i === index ? { ...item, mitigation } : item) }))}
                          className="risk-text"
                          placeholder="Rencana mitigasi…"
                          multiline
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button className="add-block-button" type="button" onClick={() => update((current) => ({ ...current, risks: [...current.risks, { id: nextId('R', current.risks.map((item) => item.id)), category: 'Produk', cause: 'Penyebab risiko baru.', impact: 'Dampak yang mungkin terjadi.', mitigation: 'Langkah mitigasi.' }] }))}>
                  <Plus size={15} /> Tambah risiko
                </button>
              </div>
            </section>

            <section className="doc-section" id="doc-milestones" data-doc-section="milestones">
              <SectionHeading number="10" title={sectionLabel('milestones', 'Rencana Rilis')} onChange={(value) => updateSectionTitle('milestones', value)} />
              <div className="milestone-timeline">
                {prd.milestones.map((milestone, index) => (
                  <div className="milestone-item" key={index}>
                    <div className="milestone-rail">
                      <span className="milestone-dot">{index + 1}</span>
                      {index < prd.milestones.length - 1 && <span className="milestone-line" />}
                    </div>
                    <div className="milestone-card">
                      <div className="milestone-head">
                        <EditableText
                          as="h3"
                          value={milestone.phase}
                          onChange={(phase) => update((current) => ({ ...current, milestones: current.milestones.map((item, i) => i === index ? { ...item, phase } : item) }))}
                          className="milestone-phase"
                          placeholder="Fase"
                        />
                        <span className="milestone-duration">
                          <CalendarDays size={12} />
                          <EditableText
                            as="span"
                            value={milestone.duration}
                            onChange={(duration) => update((current) => ({ ...current, milestones: current.milestones.map((item, i) => i === index ? { ...item, duration } : item) }))}
                            className="milestone-duration-input"
                            placeholder="Durasi"
                          />
                        </span>
                        <button className="icon-button tiny row-delete" type="button" title="Hapus fase" onClick={() => update((current) => ({ ...current, milestones: current.milestones.filter((_, i) => i !== index) }))}>
                          <X size={12} />
                        </button>
                      </div>
                      <EditableText
                        as="p"
                        value={milestone.focus}
                        onChange={(focus) => update((current) => ({ ...current, milestones: current.milestones.map((item, i) => i === index ? { ...item, focus } : item) }))}
                        className="milestone-focus"
                        placeholder="Fokus fase"
                        multiline
                      />
                      <EditableList
                        items={milestone.deliverables}
                        onChange={(deliverables) => update((current) => ({ ...current, milestones: current.milestones.map((item, i) => i === index ? { ...item, deliverables } : item) }))}
                        compact
                        addLabel="Tambah deliverable"
                      />
                    </div>
                  </div>
                ))}
                <button className="add-block-button milestone-add" type="button" onClick={() => update((current) => ({ ...current, milestones: [...current.milestones, { phase: 'Fase baru', duration: '1 minggu', focus: 'Fokus fase baru', deliverables: ['Deliverable pertama'] }] }))}>
                  <Plus size={15} /> Tambah fase
                </button>
              </div>
            </section>

            <section className="doc-section" id="doc-openQuestions" data-doc-section="openQuestions">
              <SectionHeading number="11" title={sectionLabel('openQuestions', 'Pertanyaan Terbuka')} onChange={(value) => updateSectionTitle('openQuestions', value)} />
              <p className="section-intro">Hal yang harus diputuskan sebelum tim masuk ke fase build.</p>
              <div className="question-panel">
                <EditableList
                  items={prd.openQuestions}
                  onChange={(openQuestions) => update((current) => ({ ...current, openQuestions }))}
                  addLabel="Tambah pertanyaan"
                  numbered
                />
              </div>
            </section>

            {prd.customSections.map((section, index) => (
              <section className="doc-section custom-section" id={`doc-custom-${section.id}`} data-doc-section={`custom-${section.id}`} key={section.id}>
                <div className="custom-section-head">
                  <span className="section-number">{String(12 + index).padStart(2, '0')}</span>
                  <span className="custom-tag">Kustom</span>
                  <span className="section-rule" />
                  <button className="icon-button tiny row-delete" type="button" title="Hapus bagian" onClick={() => update((current) => ({ ...current, customSections: current.customSections.filter((item) => item.id !== section.id) }))}>
                    <Trash2 size={13} />
                  </button>
                </div>
                <EditableText
                  as="h2"
                  className="custom-section-title"
                  value={section.title}
                  onChange={(title) => update((current) => ({ ...current, customSections: current.customSections.map((item) => item.id === section.id ? { ...item, title } : item) }))}
                  placeholder="Judul bagian"
                />
                <EditableText
                  value={section.content}
                  onChange={(content) => update((current) => ({ ...current, customSections: current.customSections.map((item) => item.id === section.id ? { ...item, content } : item) }))}
                  className="custom-section-content"
                  placeholder="Tulis isi bagian ini…"
                  multiline
                />
              </section>
            ))}

            <button className="add-section-button" type="button" onClick={addCustomSection}>
              <span className="add-section-icon"><Plus size={17} /></span>
              <span>
                <strong>Tambah bagian</strong>
                <small>Buat bagian kustom untuk konteks, keputusan, atau catatan tambahan.</small>
              </span>
            </button>

            <footer className="doc-footer">
              <div className="doc-footer-brand"><span className="footer-mark">a</span> adaPRD</div>
              <p>Dokumen ini adalah sumber kebenaran untuk alur kerja berikutnya. Setiap perubahan disimpan otomatis di browser ini.</p>
              <span>Diperbarui {formatDate(prd.updatedAt, true)} · {readingTime(prd)} menit baca</span>
            </footer>
          </div>
        </article>
      </div>
    </div>
  )
}
