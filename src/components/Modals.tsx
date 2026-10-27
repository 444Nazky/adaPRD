import { useEffect, useState, type ReactNode } from 'react'
import {
  Check,
  Clipboard,
  Cpu,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Link2,
  Moon,
  Server,
  Sparkles,
  Sun,
  X,
} from 'lucide-react'
import type { ModelSettings, PRD, Theme, ToastKind } from '../types'
import { aiHandoffPack, prdToMarkdown } from '../lib/export'
import { copyText } from '../lib/utils'

function ModalShell({
  title,
  description,
  onClose,
  children,
  className = '',
}: {
  title: string
  description: string
  onClose: () => void
  children: ReactNode
  className?: string
}) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function SettingsModal({
  settings,
  theme,
  onSave,
  onClose,
  onThemeChange,
  notify,
}: {
  settings: ModelSettings
  theme: Theme
  onSave: (settings: ModelSettings) => void
  onClose: () => void
  onThemeChange: (theme: Theme) => void
  notify: (message: string, kind?: ToastKind) => void
}) {
  const [draft, setDraft] = useState(settings)
  const [showKey, setShowKey] = useState(false)
  const provider = draft.provider
  const save = () => {
    onSave(draft)
    notify('Preferensi disimpan.', 'success')
    onClose()
  }
  return (
    <ModalShell title="Preferensi" description="Sesuaikan mesin generasi dan tampilan workspace." onClose={onClose} className="settings-modal">
      <div className="settings-body">
        <section className="settings-section">
          <div className="settings-section-title">
            <span>Tampilan</span>
            <p>Pilih tema yang paling nyaman untuk sesi panjang.</p>
          </div>
          <div className="theme-options">
            <button type="button" className={`theme-option ${theme === 'light' ? 'is-active' : ''}`} onClick={() => onThemeChange('light')}>
              <span className="theme-preview theme-preview-light"><Sun size={15} /></span>
              <span>Terang</span>
              {theme === 'light' && <Check size={14} />}
            </button>
            <button type="button" className={`theme-option ${theme === 'dark' ? 'is-active' : ''}`} onClick={() => onThemeChange('dark')}>
              <span className="theme-preview theme-preview-dark"><Moon size={15} /></span>
              <span>Gelap</span>
              {theme === 'dark' && <Check size={14} />}
            </button>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-title">
            <span>Mesin generasi</span>
            <p>Pilih mesin lokal bawaan atau hubungkan model bahasa pilihanmu.</p>
          </div>
          <div className="provider-options">
            <button
              type="button"
              className={`provider-option ${provider === 'local' ? 'is-active' : ''}`}
              onClick={() => setDraft({ ...draft, provider: 'local' })}
            >
              <span className="provider-icon"><Cpu size={18} /></span>
              <span className="provider-copy">
                <strong>ada engine <span className="provider-badge">Lokal</span></strong>
                <small>Langsung di browser. Tidak perlu API key.</small>
              </span>
              <span className="radio-indicator">{provider === 'local' && <span />}</span>
            </button>
            <button
              type="button"
              className={`provider-option ${provider === 'openai' ? 'is-active' : ''}`}
              onClick={() => setDraft({ ...draft, provider: 'openai' })}
            >
              <span className="provider-icon"><Server size={18} /></span>
              <span className="provider-copy">
                <strong>OpenAI-compatible API</strong>
                <small>Gunakan endpoint dan model milikmu.</small>
              </span>
              <span className="radio-indicator">{provider === 'openai' && <span />}</span>
            </button>
          </div>
          {provider === 'openai' && (
            <div className="provider-fields">
              <label className="field">
                <span><KeyRound size={13} /> API key</span>
                <div className="field-with-action">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={draft.apiKey}
                    placeholder="sk-…"
                    autoComplete="off"
                    onChange={(event) => setDraft({ ...draft, apiKey: event.target.value })}
                  />
                  <button type="button" className="field-icon" onClick={() => setShowKey((value) => !value)} aria-label={showKey ? 'Sembunyikan API key' : 'Tampilkan API key'}>
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </label>
              <div className="field-row">
                <label className="field">
                  <span>Base URL</span>
                  <input
                    type="text"
                    value={draft.baseUrl}
                    placeholder="https://api.openai.com/v1"
                    onChange={(event) => setDraft({ ...draft, baseUrl: event.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Model</span>
                  <input
                    type="text"
                    value={draft.model}
                    placeholder="gpt-4o-mini"
                    onChange={(event) => setDraft({ ...draft, model: event.target.value })}
                  />
                </label>
              </div>
              <p className="field-note"><Sparkles size={12} /> API key disimpan hanya di localStorage browser ini dan dikirim langsung ke endpoint pilihanmu. Jika gagal, adaPRD kembali ke mesin lokal.</p>
            </div>
          )}
        </section>
      </div>
      <div className="modal-footer">
        <span className="modal-footer-note">Perubahan berlaku untuk generasi berikutnya.</span>
        <div className="modal-actions">
          <button className="button ghost" type="button" onClick={onClose}>Batal</button>
          <button className="button primary" type="button" onClick={save}>Simpan preferensi</button>
        </div>
      </div>
    </ModalShell>
  )
}

export function ShareModal({
  prd,
  shareLink,
  onClose,
  notify,
}: {
  prd: PRD
  shareLink: string
  onClose: () => void
  notify: (message: string, kind?: ToastKind) => void
}) {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = async (kind: string, value: string, message: string) => {
    const success = await copyText(value)
    if (success) {
      setCopied(kind)
      notify(message, 'success')
      setTimeout(() => setCopied(null), 1800)
    } else {
      notify('Tidak dapat menyalin. Coba lagi.', 'error')
    }
  }
  return (
    <ModalShell title="Bagikan dokumen" description="Link snapshot memuat seluruh PRD, termasuk suntingan terakhir." onClose={onClose} className="share-modal">
      <div className="share-body">
        <div className="share-link-card">
          <div className="share-link-icon"><Link2 size={18} /></div>
          <div className="share-link-content">
            <span className="share-label">Link snapshot</span>
            <p>{shareLink.length > 78 ? `${shareLink.slice(0, 78)}…` : shareLink}</p>
          </div>
          <button className="button dark" type="button" onClick={() => copy('link', shareLink, 'Link snapshot disalin.')}>
            {copied === 'link' ? <Check size={14} /> : <Clipboard size={14} />}
            {copied === 'link' ? 'Tersalin' : 'Salin'}
          </button>
        </div>
        <div className="share-note">
          <span className="share-note-dot" />
          Snapshot dikemas di dalam URL. Dokumenmu tidak diunggah ke server.
        </div>
        <div className="share-grid">
          <button className="share-action-card" type="button" onClick={() => copy('handoff', aiHandoffPack(prd), 'AI handoff pack disalin.')}>
            <span className="share-action-icon share-action-accent"><Sparkles size={17} /></span>
            <span>
              <strong>AI handoff pack</strong>
              <small>PRD, 3 diagram Mermaid, dan instruksi eksekusi untuk agen AI.</small>
            </span>
            <span className="share-action-copy">{copied === 'handoff' ? <Check size={15} /> : <Clipboard size={15} />}</span>
          </button>
          <button className="share-action-card" type="button" onClick={() => copy('markdown', prdToMarkdown(prd), 'Markdown PRD disalin.')}>
            <span className="share-action-icon"><FileText size={17} /></span>
            <span>
              <strong>Markdown mentah</strong>
              <small>Seluruh dokumen dalam format Markdown yang bersih.</small>
            </span>
            <span className="share-action-copy">{copied === 'markdown' ? <Check size={15} /> : <Clipboard size={15} />}</span>
          </button>
        </div>
      </div>
      <div className="modal-footer">
        <span className="modal-footer-note">Suntingan setelah link dibagikan tidak otomatis ikut berubah.</span>
        <button className="button ghost" type="button" onClick={onClose}>Selesai</button>
      </div>
    </ModalShell>
  )
}
