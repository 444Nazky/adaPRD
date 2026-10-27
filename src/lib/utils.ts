export function uid(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 54) || 'adaprd'
}

export function formatDate(value: string, withTime = false): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date)
}

export function readingTime(prd: { executiveSummary: string; problem: string; features: unknown[] }): number {
  const words = `${prd.executiveSummary} ${prd.problem}`.split(/\s+/).length + prd.features.length * 55
  return Math.max(3, Math.ceil(words / 220))
}

export function truncate(value: string, max: number): string {
  if (value.length <= max) return value
  return `${value.slice(0, max - 1).trimEnd()}…`
}

export function wrapText(value: string, maxChars: number, maxLines = 2): string[] {
  const words = value.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    if (!line) {
      line = word
    } else if (`${line} ${word}`.length <= maxChars) {
      line += ` ${word}`
    } else {
      lines.push(line)
      line = word
    }
    if (lines.length === maxLines) break
  }
  if (line && lines.length < maxLines) lines.push(line)
  if (lines.length === maxLines) {
    const joinedLength = lines.join(' ').length
    if (joinedLength < value.length) {
      lines[maxLines - 1] = `${lines[maxLines - 1].slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`
    }
  }
  return lines
}

export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = value
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const success = document.execCommand('copy')
      document.body.removeChild(area)
      return success
    } catch {
      return false
    }
  }
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export function downloadText(value: string, fileName: string, mime = 'text/plain;charset=utf-8'): void {
  downloadBlob(new Blob([value], { type: mime }), fileName)
}

export function serializeSvg(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const viewBox = clone.getAttribute('viewBox')?.split(/\s+/).map(Number)
  if (viewBox?.length === 4) {
    clone.setAttribute('width', String(viewBox[2]))
    clone.setAttribute('height', String(viewBox[3]))
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`
}

export function downloadSvg(svg: SVGSVGElement, fileName: string): void {
  downloadBlob(new Blob([serializeSvg(svg)], { type: 'image/svg+xml;charset=utf-8' }), `${fileName}.svg`)
}

export async function svgToPngBlob(svg: SVGSVGElement, scale = 2): Promise<Blob> {
  const source = serializeSvg(svg)
  const image = new Image()
  const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Gagal merender diagram.'))
      image.src = url
    })
    const viewBox = svg.getAttribute('viewBox')?.split(/\s+/).map(Number) ?? [0, 0, 1400, 800]
    const width = viewBox[2]
    const height = viewBox[3]
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(width * scale)
    canvas.height = Math.round(height * scale)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas tidak tersedia.')
    context.scale(scale, scale)
    context.drawImage(image, 0, 0, width, height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('Gagal membuat PNG.')
    return blob
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function downloadSvgAsPng(svg: SVGSVGElement, fileName: string, scale = 2): Promise<void> {
  const blob = await svgToPngBlob(svg, scale)
  downloadBlob(blob, `${fileName}.png`)
}

export function getSavedSettings<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function saveSettings(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable in private mode; the app still works for this session.
  }
}
