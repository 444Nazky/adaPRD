import { useRef, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Check,
  CircleDollarSign,
  FileText,
  KanbanSquare,
  Network,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Workflow,
} from 'lucide-react'

const examples = [
  {
    icon: KanbanSquare,
    tag: 'Produktivitas',
    title: 'Pusat kerja tim remote',
    description: 'Kanban, otomasi, dan insight beban kerja dalam satu alur.',
    prompt:
      'Aplikasi manajemen tugas untuk tim remote dengan papan Kanban, otomasi alur kerja, komentar pada task, dan ringkasan beban kerja mingguan. Target MVP dalam 8 minggu.',
  },
  {
    icon: CircleDollarSign,
    tag: 'Fintech',
    title: 'Asisten keuangan pribadi',
    description: 'Rekening, anggaran, dan tujuan finansial yang terasa jernih.',
    prompt:
      'Asisten keuangan pribadi untuk profesional muda yang menyatukan transaksi bank, anggaran bulanan, target tabungan, dan insight pengeluaran otomatis dengan pengingat tagihan.',
  },
  {
    icon: BrainCircuit,
    tag: 'AI research',
    title: 'Ruang kerja riset AI',
    description: 'Pengetahuan tersitasi, multi-model, dan evaluasi yang terukur.',
    prompt:
      'Ruang kerja AI untuk tim riset yang bisa menghubungkan dokumen internal, membandingkan output beberapa model, menghasilkan jawaban dengan sitasi, dan mengevaluasi kualitas sebelum dirilis.',
  },
]

const contextTags = [
  { id: 'mvp', label: 'MVP 4 minggu', value: 'Target rilis MVP dalam 4 minggu.' },
  { id: 'mobile', label: 'Mobile-first', value: 'Prioritaskan pengalaman mobile-first.' },
  { id: 'ai', label: 'Integrasi AI', value: 'Sertakan kemampuan AI yang relevan dan aman.' },
]

export function Landing({ onGenerate, engineLabel = 'ada engine' }: { onGenerate: (prompt: string) => void; engineLabel?: string }) {
  const [prompt, setPrompt] = useState('')
  const [activeTags, setActiveTags] = useState<string[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canGenerate = prompt.trim().length >= 12
  const toggleTag = (id: string) => {
    setActiveTags((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }
  const submit = () => {
    if (!canGenerate) return
    const additions = contextTags.filter((tag) => activeTags.includes(tag.id)).map((tag) => tag.value)
    const fullPrompt = additions.length ? `${prompt.trim()}\n\nKonteks tambahan: ${additions.join(' ')}` : prompt.trim()
    onGenerate(fullPrompt)
  }
  const useExample = (value: string) => {
    setPrompt(value)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  return (
    <div className="landing">
      <div className="landing-glow" aria-hidden="true" />
      <section className="landing-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={13} />
            <span>Product intelligence workspace</span>
            <span className="eyebrow-new">Baru</span>
          </div>
          <h1>
            Ide mentah.
            <br />
            <em>PRD matang.</em>
            <br />
            Siap dieksekusi.
          </h1>
          <p className="hero-subtitle">
            Deskripsikan produk dalam bahasa bebas. adaPRD mengubahnya menjadi dokumen yang terstruktur, diagram sistem yang hidup, dan paket handoff yang siap dibaca agen AI.
          </p>
          <div className="hero-points">
            <span><Check size={13} /> Inline editing real-time</span>
            <span><Check size={13} /> 3 diagram sistem</span>
            <span><Check size={13} /> Ekspor siap handoff</span>
          </div>
          <div className="hero-note">
            <div className="hero-note-icon"><WandSparkles size={15} /></div>
            <p>
              <strong>Dari brief ke workspace dalam hitungan detik.</strong>
              <span>Tanpa template kaku. Tanpa kehilangan konteks.</span>
            </p>
          </div>
        </div>

        <div className="hero-prompt-wrap">
          <div className="composer-shadow" aria-hidden="true" />
          <div className="prompt-composer">
            <div className="composer-topline">
              <div className="composer-label">
                <span className="live-dot" />
                Brief produk
              </div>
              <div className="composer-engine">
                <Sparkles size={12} />
                {engineLabel}
              </div>
            </div>
            <textarea
              ref={textareaRef}
              className="composer-textarea"
              value={prompt}
              maxLength={1400}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                  event.preventDefault()
                  submit()
                }
              }}
              placeholder="Contoh: Aplikasi manajemen tugas untuk tim remote dengan Kanban, otomasi, dan laporan mingguan..."
              aria-label="Deskripsi ide produk"
            />
            <div className="composer-context">
              <span className="composer-context-label">Sertakan</span>
              {contextTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`context-chip ${activeTags.includes(tag.id) ? 'is-active' : ''}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  {activeTags.includes(tag.id) && <Check size={11} />}
                  {tag.label}
                </button>
              ))}
            </div>
            <div className="composer-footer">
              <div className="composer-shortcut">
                <kbd>⌘</kbd><kbd>↵</kbd>
                <span>untuk menyusun</span>
              </div>
              <div className="composer-submit">
                <span className="char-count">{prompt.length}<span>/1400</span></span>
                <button className="generate-button" type="button" disabled={!canGenerate} onClick={submit}>
                  <Sparkles size={15} />
                  Susun PRD
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
            {!canGenerate && prompt.length > 0 && (
              <p className="composer-validation">Tambahkan sedikit detail lagi untuk hasil yang lebih tajam.</p>
            )}
          </div>
          <div className="composer-trust">
            <span><ShieldCheck size={13} /> Data tetap di browser</span>
            <span className="trust-divider" />
            <span>Tanpa akun</span>
            <span className="trust-divider" />
            <span>Siap untuk agen AI</span>
          </div>
        </div>
      </section>

      <section className="examples-section" aria-labelledby="examples-title">
        <div className="examples-header">
          <div>
            <p className="section-kicker">Mulai cepat</p>
            <h2 id="examples-title">Belum tahu harus mulai dari mana?</h2>
          </div>
          <span className="examples-hint">Pilih satu brief untuk melihat alurnya</span>
        </div>
        <div className="example-grid">
          {examples.map((example, index) => {
            const Icon = example.icon
            return (
              <button key={example.title} className="example-card" type="button" onClick={() => useExample(example.prompt)}>
                <div className="example-top">
                  <span className={`example-icon example-icon-${index + 1}`}><Icon size={18} strokeWidth={1.8} /></span>
                  <span className="example-tag">{example.tag}</span>
                  <span className="example-arrow"><ArrowUpRight size={16} /></span>
                </div>
                <div className="example-content">
                  <h3>{example.title}</h3>
                  <p>{example.description}</p>
                </div>
                <span className="example-cta">Gunakan brief <ArrowRight size={13} /></span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="capability-strip" aria-label="Kemampuan adaPRD">
        <div className="capability-item">
          <span className="capability-icon"><FileText size={17} /></span>
          <div>
            <strong>Dokumen yang bisa disentuh</strong>
            <p>Setiap kalimat dapat diedit langsung, tanpa mode terpisah.</p>
          </div>
        </div>
        <div className="capability-item">
          <span className="capability-icon"><Network size={17} /></span>
          <div>
            <strong>Peta sistem yang hidup</strong>
            <p>Flowchart, fishbone, dan dependency graph selalu sinkron.</p>
          </div>
        </div>
        <div className="capability-item">
          <span className="capability-icon"><Workflow size={17} /></span>
          <div>
            <strong>Handoff tanpa gesekan</strong>
            <p>MD, PDF, JSON, SVG, PNG, dan source Mermaid dalam satu klik.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <span>adaPRD</span>
        <span>Dirancang untuk founder, product team, dan agen AI.</span>
      </footer>
    </div>
  )
}
