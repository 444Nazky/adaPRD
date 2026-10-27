import { Check, Sparkles } from 'lucide-react'
import { Logo } from './Chrome'

const steps = [
  'Membaca ide dan konteks',
  'Menyusun struktur PRD',
  'Menajamkan requirement',
  'Membangun peta sistem',
  'Menyiapkan dokumen',
]

export function GenerationOverlay({ step, prompt }: { step: number; prompt: string }) {
  return (
    <div className="generation-overlay" role="status" aria-live="polite">
      <div className="generation-card">
        <div className="generation-brand">
          <Logo />
          <span className="generation-badge"><span className="live-dot" /> generating</span>
        </div>
        <div className="generation-orb">
          <div className="orb-ring orb-ring-1" />
          <div className="orb-ring orb-ring-2" />
          <div className="orb-core"><Sparkles size={22} /></div>
        </div>
        <div className="generation-copy">
          <p className="generation-kicker">Menyusun produkmu</p>
          <h2>Dari brief menjadi <em>build-ready.</em></h2>
          <p className="generation-prompt">“{prompt.length > 150 ? `${prompt.slice(0, 150)}…` : prompt}”</p>
        </div>
        <div className="generation-progress">
          <div className="generation-progress-track">
            <span style={{ width: `${Math.max(8, ((step + 1) / steps.length) * 100)}%` }} />
          </div>
          <div className="generation-steps">
            {steps.map((label, index) => (
              <div key={label} className={`generation-step ${index < step ? 'is-done' : ''} ${index === step ? 'is-active' : ''}`}>
                <span className="generation-step-marker">
                  {index < step ? <Check size={11} /> : <span />}
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="generation-footer">Tiga diagram sistem akan dibuat otomatis dari struktur PRD.</p>
      </div>
    </div>
  )
}
