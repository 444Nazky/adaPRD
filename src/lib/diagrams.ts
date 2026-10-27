import type { Feature, FlowEdge, FlowNode, PRD } from '../types'
import { SUPPLEMENTARY_CAUSES } from './generator'
import { wrapText } from './utils'

export type FlowData = {
  nodes: FlowNode[]
  edges: FlowEdge[]
  width: number
  height: number
}

export type FishboneData = {
  groups: Array<{ id: string; category: string; causes: string[]; side: 'top' | 'bottom'; index: number }>
  spineY: number
  topTipY: number
  bottomTipY: number
  topSlots: Array<{ baseX: number; tipX: number }>
  bottomSlots: Array<{ baseX: number; tipX: number }>
  headX: number
  headY: number
  headWidth: number
  headHeight: number
  width: number
  height: number
}

export type DependencyNode = {
  feature: Feature
  x: number
  y: number
  layer: number
}

export type DependencyData = {
  nodes: DependencyNode[]
  edges: Array<{ from: string; to: string }>
  layers: Array<{ index: number; label: string; count: number }>
  width: number
  height: number
  nodeWidth: number
  nodeHeight: number
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const priorityRank = { P0: 0, P1: 1, P2: 2 }

export function getFlowData(prd: PRD): FlowData {
  const features = prd.features
  const name = (index: number, fallback: string) => features[index]?.name || fallback
  const nodes: FlowNode[] = [
    { id: 'start', type: 'start', label: 'Mulai', x: 54, y: 246, width: 112, height: 48 },
    { id: 'f0', type: 'process', label: name(0, 'Buat workspace'), x: 216, y: 234, width: 200, height: 72, featureId: features[0]?.id },
    { id: 'f1', type: 'process', label: name(1, 'Selesaikan aksi inti'), x: 468, y: 234, width: 200, height: 72, featureId: features[1]?.id },
    { id: 'decision', type: 'decision', label: 'Butuh kolaborasi?', x: 720, y: 220, width: 176, height: 100 },
    { id: 'f2', type: 'process', label: name(2, 'Undang rekan'), x: 948, y: 118, width: 200, height: 72, featureId: features[2]?.id },
    { id: 'f3', type: 'process', label: name(3, 'Optimalkan alur'), x: 948, y: 352, width: 200, height: 72, featureId: features[3]?.id },
    { id: 'f4', type: 'process', label: name(4, 'Baca insight'), x: 1200, y: 234, width: 200, height: 72, featureId: features[4]?.id },
    { id: 'end', type: 'end', label: 'Nilai terkirim', x: 1452, y: 246, width: 142, height: 48 },
  ]
  const edges: FlowEdge[] = [
    { id: 'e1', from: 'start', to: 'f0' },
    { id: 'e2', from: 'f0', to: 'f1' },
    { id: 'e3', from: 'f1', to: 'decision' },
    { id: 'e4', from: 'decision', to: 'f2', label: 'Ya', kind: 'yes' },
    { id: 'e5', from: 'decision', to: 'f3', label: 'Belum', kind: 'no' },
    { id: 'e6', from: 'f2', to: 'f4' },
    { id: 'e7', from: 'f3', to: 'f4' },
    { id: 'e8', from: 'f4', to: 'end' },
  ]
  return { nodes, edges, width: 1640, height: 532 }
}

export function getFishboneData(prd: PRD): FishboneData {
  const order = ['Orang', 'Proses', 'Platform', 'Data', 'Produk', 'Eksternal']
  const risks = prd.risks.filter((r) => r.category && r.cause)
  const uniqueCategories = Array.from(new Set(risks.map((r) => r.category)))
  for (const fallback of order) {
    if (uniqueCategories.length >= 6) break
    if (!uniqueCategories.includes(fallback)) uniqueCategories.push(fallback)
  }
  const categories = uniqueCategories.slice(0, 6)
  const groups = categories.map((category, index) => {
    const causes = risks.filter((r) => r.category === category).map((r) => r.cause)
    const supplement = SUPPLEMENTARY_CAUSES[category] ?? 'Belum ada data penyebab yang cukup untuk kategori ini.'
    if (causes.length < 2) causes.push(supplement)
    return {
      id: `fish-${index}`,
      category,
      causes: causes.slice(0, 2),
      side: (index < 3 ? 'top' : 'bottom') as 'top' | 'bottom',
      index,
    }
  })
  const topSlots = [
    { baseX: 360, tipX: 210 },
    { baseX: 730, tipX: 580 },
    { baseX: 1100, tipX: 950 },
  ]
  const bottomSlots = [
    { baseX: 545, tipX: 395 },
    { baseX: 915, tipX: 765 },
    { baseX: 1265, tipX: 1115 },
  ]
  return {
    groups,
    spineY: 390,
    topTipY: 158,
    bottomTipY: 640,
    topSlots,
    bottomSlots,
    headX: 1288,
    headY: 312,
    headWidth: 262,
    headHeight: 156,
    width: 1596,
    height: 776,
  }
}

export function getDependencyData(prd: PRD): DependencyData {
  const features = prd.features
  const validIds = new Set(features.map((f) => f.id))
  const depthCache = new Map<string, number>()
  const visiting = new Set<string>()
  const getDepth = (feature: Feature): number => {
    const cached = depthCache.get(feature.id)
    if (cached !== undefined) return cached
    if (visiting.has(feature.id)) return 0
    visiting.add(feature.id)
    const validDeps = feature.dependencies.filter((id) => validIds.has(id) && id !== feature.id)
    const depth = validDeps.length
      ? Math.min(4, Math.max(...validDeps.map((id) => getDepth(features.find((f) => f.id === id)!) + 1)))
      : 0
    visiting.delete(feature.id)
    depthCache.set(feature.id, depth)
    return depth
  }

  const grouped = new Map<number, Feature[]>()
  const sorted = [...features].sort((a, b) => {
    const byPriority = priorityRank[a.priority] - priorityRank[b.priority]
    return byPriority || a.id.localeCompare(b.id)
  })
  for (const feature of sorted) {
    const depth = getDepth(feature)
    grouped.set(depth, [...(grouped.get(depth) ?? []), feature])
  }
  const layerIndices = [...grouped.keys()].sort((a, b) => a - b)
  const maxRows = Math.max(...layerIndices.map((i) => grouped.get(i)!.length), 1)
  const nodeWidth = 218
  const nodeHeight = 82
  const colGap = 300
  const rowGap = 116
  const startX = 84
  const startY = 156
  const contentHeight = maxRows * rowGap
  const nodes: DependencyNode[] = []
  for (const layerIdx of layerIndices) {
    const items = grouped.get(layerIdx)!
    const layerHeight = items.length * rowGap
    items.forEach((feature, i) => {
      nodes.push({
        feature,
        x: startX + layerIdx * colGap,
        y: startY + (contentHeight - layerHeight) / 2 + i * rowGap,
        layer: layerIdx,
      })
    })
  }
  const edges = features.flatMap((feature) =>
    feature.dependencies
      .filter((dependency) => validIds.has(dependency) && dependency !== feature.id)
      .map((dependency) => ({ from: dependency, to: feature.id })),
  )
  const stageLabels = ['Fondasi', 'Aktivasi', 'Alur inti', 'Skala', 'Ekspansi']
  const layers = layerIndices.map((index, i) => ({
    index,
    label: stageLabels[clamp(i, 0, stageLabels.length - 1)] ?? `Lapisan ${i + 1}`,
    count: grouped.get(index)!.length,
  }))
  const width = Math.max(1240, startX + (layerIndices[layerIndices.length - 1] + 1) * colGap + 40)
  const height = Math.max(600, startY + contentHeight + 100)
  return { nodes, edges, layers, width, height, nodeWidth, nodeHeight }
}

export function flowLabelLines(node: FlowNode): string[] {
  const max = node.type === 'decision' ? 19 : 23
  return wrapText(node.label, max, 2)
}

const mermaidSafe = (value: string) =>
  value
    .replace(/["'`]/g, '')
    .replace(/[\[\]{}()|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export function flowMermaid(prd: PRD): string {
  const data = getFlowData(prd)
  const nodeLine = (node: FlowNode) => {
    const label = mermaidSafe(node.label)
    if (node.type === 'start' || node.type === 'end') return `${node.id}(["${label}"])`
    if (node.type === 'decision') return `${node.id}{"${label}"}`
    return `${node.id}["${label}"]`
  }
  const lines = ['flowchart LR', ...data.nodes.map((node) => `  ${nodeLine(node)}`)]
  for (const edge of data.edges) {
    lines.push(`  ${edge.from} ${edge.label ? `-->|${mermaidSafe(edge.label)}|` : '-->'} ${edge.to}`)
  }
  lines.push(
    '  classDef startEnd fill:#171411,color:#fff7ed,stroke:#171411,stroke-width:1px',
    '  classDef process fill:#fffdf8,color:#1f1b16,stroke:#ded5c6,stroke-width:1px',
    '  classDef decision fill:#fff1e8,color:#1f1b16,stroke:#f05a35,stroke-width:1.5px',
    `  class ${data.nodes.filter((n) => n.type === 'start' || n.type === 'end').map((n) => n.id).join(',')} startEnd`,
    `  class ${data.nodes.filter((n) => n.type === 'process').map((n) => n.id).join(',')} process`,
    `  class ${data.nodes.filter((n) => n.type === 'decision').map((n) => n.id).join(',')} decision`,
  )
  return lines.join('\n')
}

export function fishboneMermaid(prd: PRD): string {
  const data = getFishboneData(prd)
  const lines = ['mindmap', `  root((${mermaidSafe(prd.fishboneProblem || 'Akar masalah')}))`]
  for (const group of data.groups) {
    lines.push(`    ${mermaidSafe(group.category)}`)
    for (const cause of group.causes) {
      lines.push(`      ${mermaidSafe(cause)}`)
    }
  }
  return lines.join('\n')
}

export function dependenciesMermaid(prd: PRD): string {
  const data = getDependencyData(prd)
  const byId = new Map(prd.features.map((f) => [f.id, f]))
  const lines = ['flowchart LR']
  data.layers.forEach((layer) => {
    lines.push(`  subgraph L${layer.index}["${mermaidSafe(layer.label)}"]`)
    lines.push('    direction TB')
    data.nodes
      .filter((node) => node.layer === layer.index)
      .forEach((node) => lines.push(`    ${node.feature.id.replace('-', '')}["${mermaidSafe(node.feature.name)}"]`))
    lines.push('  end')
  })
  for (const edge of data.edges) {
    lines.push(`  ${edge.from.replace('-', '')} --> ${edge.to.replace('-', '')}`)
  }
  const byPriority = (priority: Feature['priority']) =>
    prd.features
      .filter((feature) => feature.priority === priority)
      .map((feature) => feature.id.replace('-', ''))
      .join(',')
  if (byPriority('P0')) lines.push(`  classDef p0 fill:#fff1e8,stroke:#f05a35,color:#1f1b16`)
  if (byPriority('P1')) lines.push(`  classDef p1 fill:#f6f2e9,stroke:#cbbfa9,color:#1f1b16`)
  if (byPriority('P2')) lines.push(`  classDef p2 fill:#f1f5ef,stroke:#b9c6b2,color:#1f1b16`)
  if (byPriority('P0')) lines.push(`  class ${byPriority('P0')} p0`)
  if (byPriority('P1')) lines.push(`  class ${byPriority('P1')} p1`)
  if (byPriority('P2')) lines.push(`  class ${byPriority('P2')} p2`)
  for (const [id, feature] of byId) {
    if (!feature.dependencies.length) continue
    void id
  }
  return lines.join('\n')
}

export const diagramSource = {
  flow: flowMermaid,
  fishbone: fishboneMermaid,
  dependencies: dependenciesMermaid,
}
