import type { PRD } from '../types'
import { downloadText, formatDate, slugify } from './utils'
import { diagramSource } from './diagrams'

const label = (prd: PRD, key: keyof PRD['sectionTitles'], fallback: string) =>
  prd.sectionTitles?.[key] || fallback

export function prdToMarkdown(prd: PRD): string {
  const lines: string[] = []
  lines.push('---')
  lines.push(`title: "${prd.title.replace(/"/g, '\\"')}"`)
  lines.push(`status: ${prd.status}`)
  lines.push(`generated: ${prd.createdAt}`)
  lines.push(`updated: ${prd.updatedAt}`)
  lines.push(`platform: "${prd.platform}"`)
  lines.push(`audience: "${prd.audience}"`)
  lines.push('---', '')
  lines.push(`# ${prd.title}`)
  lines.push('', `> ${prd.tagline}`, '')
  lines.push(`**Status:** ${prd.status}  `)
  lines.push(`**Platform:** ${prd.platform}  `)
  lines.push(`**Target pengguna:** ${prd.audience}  `)
  lines.push(`**Timeline:** ${prd.timeline}  `)
  lines.push(`**Tim:** ${prd.team}  `)
  lines.push(`**Diperbarui:** ${formatDate(prd.updatedAt, true)}`)
  lines.push('', '---', '')
  lines.push(`## ${label(prd, 'summary', 'Ringkasan Eksekutif')}`, '')
  lines.push(prd.executiveSummary, '')
  lines.push('### Masalah', '', prd.problem, '')
  lines.push('### Solusi', '', prd.solution, '')
  lines.push('## Brief Asli', '', `> ${prd.prompt.replace(/\n/g, '\n> ')}`, '')
  lines.push(`## ${label(prd, 'goals', 'Tujuan & Metrik')}`, '')
  prd.goals.forEach((goal) => lines.push(`- ${goal}`))
  lines.push('', '| Metrik | Target | Definisi |', '| --- | --- | --- |')
  prd.metrics.forEach((metric) => lines.push(`| ${metric.name} | ${metric.target} | ${metric.description} |`))
  lines.push('')
  lines.push(`## ${label(prd, 'personas', 'Persona & Pengguna')}`, '')
  prd.personas.forEach((persona) => {
    lines.push(`### ${persona.name} — ${persona.role}`, '')
    lines.push(`> "${persona.quote}"`, '')
    lines.push(`- **Pain point:** ${persona.pain}`)
    lines.push(`- **Tujuan:** ${persona.goal}`, '')
  })
  lines.push(`## ${label(prd, 'features', 'Lingkup Fitur')}`, '')
  lines.push('| ID | Fitur | Prioritas | Kompleksitas | Fase |', '| --- | --- | --- | --- | --- |')
  prd.features.forEach((feature) => {
    lines.push(`| ${feature.id} | ${feature.name} | ${feature.priority} | ${feature.complexity} | ${feature.phase} |`)
  })
  lines.push('')
  prd.features.forEach((feature) => {
    lines.push(`### ${feature.id} · ${feature.name}`, '')
    lines.push(`${feature.description}`, '')
    lines.push(`- **Prioritas:** ${feature.priority}`)
    lines.push(`- **Kompleksitas:** ${feature.complexity}`)
    lines.push(`- **Fase:** ${feature.phase}`)
    lines.push(`- **Dependensi:** ${feature.dependencies.length ? feature.dependencies.join(', ') : 'Tidak ada'}`)
    lines.push('- **Acceptance criteria:**')
    feature.acceptance.forEach((criterion) => lines.push(`  - [ ] ${criterion}`))
    lines.push('')
  })
  lines.push(`## ${label(prd, 'stories', 'User Stories')}`, '')
  prd.userStories.forEach((story) => {
    lines.push(`- **${story.id}** (${story.priority}) — Sebagai ${story.role}, saya ingin ${story.action}, agar ${story.outcome}.`)
  })
  lines.push('')
  lines.push(`## ${label(prd, 'functional', 'Kebutuhan Fungsional')}`, '')
  prd.functional.forEach((requirement) => {
    lines.push(`### ${requirement.id} · ${requirement.title} [${requirement.priority}]`, '', requirement.detail, '')
  })
  lines.push(`## ${label(prd, 'nonFunctional', 'Kebutuhan Non-Fungsional')}`, '')
  lines.push('| ID | Kategori | Target | Detail |', '| --- | --- | --- | --- |')
  prd.nonFunctional.forEach((requirement) => {
    lines.push(`| ${requirement.id} | ${requirement.category} | ${requirement.target} | ${requirement.detail} |`)
  })
  lines.push('')
  lines.push(`## ${label(prd, 'tech', 'Arsitektur & Parameter Teknis')}`, '')
  lines.push(prd.tech.architecture, '')
  lines.push('**Stack:**', ...prd.tech.stack.map((item) => `- ${item}`), '')
  lines.push('**Integrasi:**', ...prd.tech.integrations.map((item) => `- ${item}`), '')
  lines.push('### Entitas data', '', '| Entitas | Field kunci |', '| --- | --- |')
  prd.tech.entities.forEach((entity) => lines.push(`| ${entity.name} | ${entity.fields} |`))
  lines.push('', '### Endpoint utama', '', '| Method | Path | Tujuan |', '| --- | --- | --- |')
  prd.tech.endpoints.forEach((endpoint) => lines.push(`| ${endpoint.method} | \`${endpoint.path}\` | ${endpoint.purpose} |`))
  lines.push('')
  lines.push(`## ${label(prd, 'risks', 'Risiko & Asumsi')}`, '')
  lines.push('| ID | Kategori | Penyebab | Dampak | Mitigasi |', '| --- | --- | --- | --- | --- |')
  prd.risks.forEach((risk) => {
    lines.push(`| ${risk.id} | ${risk.category} | ${risk.cause} | ${risk.impact} | ${risk.mitigation} |`)
  })
  lines.push('')
  lines.push(`## ${label(prd, 'milestones', 'Rencana Rilis')}`, '')
  prd.milestones.forEach((milestone) => {
    lines.push(`### ${milestone.phase} · ${milestone.duration}`, '', `**Fokus:** ${milestone.focus}`, '')
    milestone.deliverables.forEach((deliverable) => lines.push(`- ${deliverable}`))
    lines.push('')
  })
  lines.push(`## ${label(prd, 'openQuestions', 'Pertanyaan Terbuka')}`, '')
  prd.openQuestions.forEach((question) => lines.push(`- ${question}`))
  lines.push('')
  for (const section of prd.customSections) {
    lines.push(`## ${section.title}`, '', section.content, '')
  }
  lines.push('---', '', `_Dokumen ini disusun dengan adaPRD. Brief asli: "${prd.prompt.replace(/\n/g, ' ')}"_`)
  return lines.join('\n')
}

export function prdToJson(prd: PRD): string {
  return JSON.stringify(
    {
      schema: 'adaprd/prd@1.0',
      generatedBy: 'adaPRD',
      document: prd,
    },
    null,
    2,
  )
}

export function aiHandoffPack(prd: PRD): string {
  const diagramLines = [
    '## Diagram: Flowchart (Mermaid)',
    '```mermaid',
    diagramSource.flow(prd),
    '```',
    '',
    '## Diagram: Fishbone (Mermaid mindmap)',
    '```mermaid',
    diagramSource.fishbone(prd),
    '```',
    '',
    '## Diagram: Dependency Graph (Mermaid)',
    '```mermaid',
    diagramSource.dependencies(prd),
    '```',
  ].join('\n')
  return `${prdToMarkdown(prd)}\n\n---\n\n${diagramLines}\n\n## Instruksi untuk agen AI\nGunakan PRD ini sebagai sumber kebenaran. Sebelum menulis kode: ringkas asumsi, identifikasi dependensi yang belum jelas, dan ajukan maksimal 3 pertanyaan. Setelah itu susun rencana implementasi bertahap dengan acceptance criteria yang dapat diuji.`
}


export function downloadMarkdown(prd: PRD): void {
  downloadText(prdToMarkdown(prd), `${slugify(prd.title)}.md`, 'text/markdown;charset=utf-8')
}

export function downloadJson(prd: PRD): void {
  downloadText(prdToJson(prd), `${slugify(prd.title)}.json`, 'application/json;charset=utf-8')
}

const pdfSafe = (value: string) =>
  value
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/·/g, '|')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/→/g, '->')
    .replace(/•/g, '-')
    .replace(/\u00a0/g, ' ')

async function createPdfDocument(prd: PRD) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 54
  const maxWidth = pageWidth - margin * 2
  let page = 1

  doc.setFillColor(247, 243, 235)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')
  doc.setFillColor(240, 90, 53)
  doc.circle(pageWidth - 36, 22, 138, 'F')
  doc.setFillColor(247, 243, 235)
  doc.circle(pageWidth - 20, 6, 105, 'F')
  doc.setTextColor(23, 20, 17)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('adaPRD', margin, 64)
  doc.setDrawColor(220, 211, 198)
  doc.line(margin, 78, pageWidth - margin, 78)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(104, 96, 85)
  doc.text('PRODUCT REQUIREMENTS DOCUMENT', margin, 96)
  doc.setTextColor(23, 20, 17)
  doc.setFont('times', 'bold')
  doc.setFontSize(38)
  const titleLines = doc.splitTextToSize(pdfSafe(prd.title), maxWidth - 30)
  doc.text(titleLines, margin, 180, { lineHeightFactor: 1.08 })
  let coverY = 180 + titleLines.length * 43
  doc.setFont('times', 'italic')
  doc.setFontSize(18)
  doc.setTextColor(120, 88, 70)
  const tagline = doc.splitTextToSize(pdfSafe(prd.tagline), maxWidth - 40)
  doc.text(tagline, margin, coverY + 14, { lineHeightFactor: 1.2 })
  coverY += 14 + tagline.length * 22 + 24
  doc.setDrawColor(240, 90, 53)
  doc.setLineWidth(2)
  doc.line(margin, coverY, margin + 48, coverY)
  coverY += 34
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(66, 60, 52)
  const meta = [
    ['Status', prd.status],
    ['Platform', prd.platform],
    ['Target pengguna', prd.audience],
    ['Timeline', prd.timeline],
    ['Diperbarui', formatDate(prd.updatedAt, true)],
  ]
  meta.forEach(([key, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(`${key}`, margin, coverY)
    doc.setFont('helvetica', 'normal')
    const wrapped = doc.splitTextToSize(pdfSafe(value), maxWidth - 160)
    doc.text(wrapped, margin + 110, coverY)
    coverY += Math.max(18, wrapped.length * 14 + 4)
  })
  doc.setFillColor(255, 252, 246)
  doc.roundedRect(margin, pageHeight - 190, maxWidth, 112, 8, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(240, 90, 53)
  doc.text('BRIEF ASLI', margin + 18, pageHeight - 162)
  doc.setFont('times', 'italic')
  doc.setFontSize(10)
  doc.setTextColor(70, 63, 54)
  const brief = doc.splitTextToSize(pdfSafe(prd.prompt), maxWidth - 36)
  doc.text(brief.slice(0, 5), margin + 18, pageHeight - 143, { lineHeightFactor: 1.3 })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(136, 127, 114)
  doc.text('Dokumen ini dihasilkan dan dapat disunting di adaPRD.', margin, pageHeight - 32)

  let y = 0
  const startContentPage = () => {
    doc.addPage()
    page += 1
    doc.setFillColor(255, 254, 251)
    doc.rect(0, 0, pageWidth, pageHeight, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(240, 90, 53)
    doc.text('adaPRD', margin, 36)
    doc.setTextColor(136, 127, 114)
    doc.setFont('helvetica', 'normal')
    doc.text(prd.status.toUpperCase(), pageWidth - margin, 36, { align: 'right' })
    doc.setDrawColor(232, 225, 214)
    doc.setLineWidth(0.7)
    doc.line(margin, 46, pageWidth - margin, 46)
    y = 74
  }
  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - 54) startContentPage()
  }
  const section = (title: string, number: string) => {
    ensureSpace(60)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(240, 90, 53)
    doc.text(number, margin, y + 8)
    doc.setTextColor(23, 20, 17)
    doc.setFont('times', 'bold')
    doc.setFontSize(22)
    doc.text(pdfSafe(title), margin, y + 29)
    doc.setDrawColor(232, 225, 214)
    doc.setLineWidth(0.7)
    doc.line(margin, y + 40, pageWidth - margin, y + 40)
    y += 60
  }
  const paragraph = (text: string, size = 10, color: [number, number, number] = [65, 59, 51]) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(size)
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(pdfSafe(text), maxWidth)
    for (const line of lines) {
      ensureSpace(17)
      doc.text(line, margin, y)
      y += 15
    }
    y += 6
  }
  const smallHeading = (text: string) => {
    ensureSpace(26)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(23, 20, 17)
    doc.text(pdfSafe(text), margin, y)
    y += 18
  }
  const bullet = (text: string, indent = 0) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.4)
    doc.setTextColor(70, 63, 54)
    const lines = doc.splitTextToSize(pdfSafe(text), maxWidth - indent - 14)
    ensureSpace(lines.length * 14 + 6)
    doc.setFillColor(240, 90, 53)
    doc.circle(margin + indent + 3, y - 3, 2, 'F')
    doc.text(lines, margin + indent + 12, y)
    y += lines.length * 13 + 5
  }
  const keyValue = (key: string, value: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(128, 117, 102)
    const lines = doc.splitTextToSize(pdfSafe(value), maxWidth - 110)
    ensureSpace(lines.length * 13 + 5)
    doc.text(key.toUpperCase(), margin, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(62, 56, 48)
    doc.text(lines, margin + 104, y)
    y += lines.length * 13 + 4
  }

  startContentPage()
  section(label(prd, 'summary', 'Ringkasan Eksekutif'), '01')
  paragraph(prd.executiveSummary, 10.5)
  smallHeading('Masalah')
  paragraph(prd.problem)
  smallHeading('Solusi')
  paragraph(prd.solution)

  section(label(prd, 'goals', 'Tujuan & Metrik'), '02')
  prd.goals.forEach((goal) => bullet(goal))
  y += 4
  prd.metrics.forEach((metric) => {
    smallHeading(metric.name)
    keyValue('Target', metric.target)
    paragraph(metric.description, 9)
  })

  section(label(prd, 'personas', 'Persona & Pengguna'), '03')
  prd.personas.forEach((persona) => {
    smallHeading(`${persona.name} · ${persona.role}`)
    paragraph(`"${persona.quote}"`, 9.5, [120, 88, 70])
    keyValue('Pain point', persona.pain)
    keyValue('Tujuan', persona.goal)
    y += 4
  })

  section(label(prd, 'features', 'Lingkup Fitur'), '04')
  prd.features.forEach((feature) => {
    ensureSpace(104)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(240, 90, 53)
    doc.text(feature.id, margin, y)
    doc.setTextColor(23, 20, 17)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(pdfSafe(feature.name), margin + 42, y)
    y += 16
    keyValue('Prioritas', `${feature.priority} · ${feature.complexity} · ${feature.phase}`)
    paragraph(feature.description, 9.2)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(128, 117, 102)
    ensureSpace(16)
    doc.text('ACCEPTANCE CRITERIA', margin + 10, y)
    y += 14
    feature.acceptance.forEach((criterion) => bullet(criterion, 10))
    y += 4
  })

  section(label(prd, 'stories', 'User Stories'), '05')
  prd.userStories.forEach((story) => {
    smallHeading(`${story.id} · ${story.priority}`)
    paragraph(`Sebagai ${story.role}, saya ingin ${story.action}, agar ${story.outcome}.`, 9.4)
  })

  section(label(prd, 'functional', 'Kebutuhan Fungsional'), '06')
  prd.functional.forEach((requirement) => {
    smallHeading(`${requirement.id} · ${requirement.title} [${requirement.priority}]`)
    paragraph(requirement.detail, 9.2)
  })

  section(label(prd, 'nonFunctional', 'Kebutuhan Non-Fungsional'), '07')
  prd.nonFunctional.forEach((requirement) => {
    keyValue(requirement.category, `${requirement.target} — ${requirement.detail}`)
  })

  section(label(prd, 'tech', 'Arsitektur & Parameter Teknis'), '08')
  paragraph(prd.tech.architecture)
  smallHeading('Stack')
  paragraph(prd.tech.stack.join(' · '), 9.2)
  smallHeading('Integrasi')
  paragraph(prd.tech.integrations.join(' · '), 9.2)
  smallHeading('Entitas data')
  prd.tech.entities.forEach((entity) => keyValue(entity.name, entity.fields))
  smallHeading('Endpoint utama')
  prd.tech.endpoints.forEach((endpoint) => {
    ensureSpace(30)
    doc.setFont('courier', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(240, 90, 53)
    doc.text(endpoint.method, margin, y)
    doc.setTextColor(23, 20, 17)
    doc.text(pdfSafe(endpoint.path), margin + 44, y)
    y += 12
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.7)
    doc.setTextColor(85, 76, 65)
    doc.text(pdfSafe(endpoint.purpose), margin + 44, y)
    y += 17
  })

  section(label(prd, 'risks', 'Risiko & Asumsi'), '09')
  prd.risks.forEach((risk) => {
    smallHeading(`${risk.id} · ${risk.category}`)
    keyValue('Penyebab', risk.cause)
    keyValue('Dampak', risk.impact)
    keyValue('Mitigasi', risk.mitigation)
    y += 3
  })

  section(label(prd, 'milestones', 'Rencana Rilis'), '10')
  prd.milestones.forEach((milestone) => {
    smallHeading(`${milestone.phase} · ${milestone.duration}`)
    paragraph(milestone.focus, 9.2)
    milestone.deliverables.forEach((deliverable) => bullet(deliverable))
    y += 2
  })

  section(label(prd, 'openQuestions', 'Pertanyaan Terbuka'), '11')
  prd.openQuestions.forEach((question) => bullet(question))

  for (const custom of prd.customSections) {
    section(custom.title || 'Bagian tambahan', '12')
    paragraph(custom.content)
  }

  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i)
    if (i === 1) continue
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(143, 134, 121)
    doc.text(`adaPRD · ${prd.title}`, margin, pageHeight - 26)
    doc.text(`${i} / ${totalPages}`, pageWidth - margin, pageHeight - 26, { align: 'right' })
  }
  void page
  return doc
}

export async function downloadPdf(prd: PRD): Promise<void> {
  const doc = await createPdfDocument(prd)
  doc.save(`${slugify(prd.title)}.pdf`)
}

export async function createPdfBlob(prd: PRD): Promise<Blob> {
  const doc = await createPdfDocument(prd)
  return doc.output('blob')
}
