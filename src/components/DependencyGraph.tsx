import { useEffect, useMemo, useState, type RefObject } from 'react'
import type { PRD } from '../types'
import { getDependencyData } from '../lib/diagrams'
import { truncate, wrapText } from '../lib/utils'
import { DiagramControls, GraphDefs, graphPalette, usePanZoom } from './DiagramSurface'

type Positions = Record<string, { x: number; y: number }>

export function DependencyGraph({
  prd,
  svgRef,
  dark,
  staticMode = false,
  selectedFeatureId,
  onSelectFeature,
  resetKey,
}: {
  prd: PRD
  svgRef: RefObject<SVGSVGElement | null>
  dark: boolean
  staticMode?: boolean
  selectedFeatureId?: string | null
  onSelectFeature?: (id: string) => void
  resetKey?: number
}) {
  const data = useMemo(() => getDependencyData(prd), [prd])
  const palette = graphPalette(staticMode ? false : dark)
  const enabled = !staticMode
  const canvas = usePanZoom(data.width, data.height, svgRef, enabled)
  const initialPositions = useMemo(() => Object.fromEntries(data.nodes.map((node) => [node.feature.id, { x: node.x, y: node.y }])) as Positions, [data])
  const [positions, setPositions] = useState<Positions>(initialPositions)
  const [hovered, setHovered] = useState<string | null>(null)
  const layoutKey = data.nodes.map((node) => `${node.feature.id}:${node.x}:${node.y}`).join('|')

  useEffect(() => {
    setPositions(initialPositions)
  }, [layoutKey, initialPositions])

  useEffect(() => {
    if (!resetKey) return
    setPositions(initialPositions)
    canvas.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  const focusId = hovered ?? selectedFeatureId ?? null
  const relatedEdges = focusId ? data.edges.filter((edge) => edge.from === focusId || edge.to === focusId) : []
  const relatedNodeIds = new Set<string>(relatedEdges.flatMap((edge) => [edge.from, edge.to]).concat(focusId ?? ''))
  const getPos = (id: string, fallbackX: number, fallbackY: number) => positions[id] ?? { x: fallbackX, y: fallbackY }

  const edgePath = (from: string, to: string) => {
    const fromNode = data.nodes.find((node) => node.feature.id === from)
    const toNode = data.nodes.find((node) => node.feature.id === to)
    if (!fromNode || !toNode) return ''
    const fromPos = getPos(from, fromNode.x, fromNode.y)
    const toPos = getPos(to, toNode.x, toNode.y)
    const sourceX = fromPos.x + data.nodeWidth
    const sourceY = fromPos.y + data.nodeHeight / 2
    const targetX = toPos.x
    const targetY = toPos.y + data.nodeHeight / 2
    if (targetX > sourceX) {
      const curve = Math.max(52, (targetX - sourceX) * 0.48)
      return `M ${sourceX} ${sourceY} C ${sourceX + curve} ${sourceY}, ${targetX - curve} ${targetY}, ${targetX} ${targetY}`
    }
    const dropY = sourceY > targetY ? 42 : -42
    return `M ${sourceX} ${sourceY} C ${sourceX + 64} ${sourceY}, ${sourceX + 64} ${sourceY + dropY}, ${sourceX} ${sourceY + dropY} C ${sourceX - 44} ${sourceY + dropY}, ${targetX - 44} ${targetY}, ${targetX} ${targetY}`
  }

  const transform = enabled
    ? `translate(${data.width / 2 + canvas.view.x} ${data.height / 2 + canvas.view.y}) scale(${canvas.view.k}) translate(${-data.width / 2} ${-data.height / 2})`
    : undefined

  return (
    <div className={`diagram-surface dependency-surface ${staticMode ? 'is-static' : ''}`}>
      <svg
        ref={svgRef}
        className={`diagram-svg ${canvas.panning ? 'is-panning' : ''}`}
        viewBox={`0 0 ${data.width} ${data.height}`}
        role="img"
        aria-label="Dependency graph antar-fitur"
        style={{ touchAction: 'none' }}
        {...(enabled ? canvas.handlers : {})}
      >
        <GraphDefs id="dep" palette={palette} dark={!staticMode && dark} />
        <rect width={data.width} height={data.height} fill="url(#dep-dots)" />
        <rect width={data.width} height={data.height} fill={palette.bg} opacity="0.84" />
        <g transform={transform}>
          <text x={84} y={58} fill={palette.muted} fontSize="9" fontWeight="700" letterSpacing="1.5" fontFamily="Manrope, sans-serif">DEPENDENCY MAP</text>
          <text x={84} y={79} fill={palette.text} fontSize="14" fontWeight="650" letterSpacing="-0.2" fontFamily="Manrope, sans-serif">Urutan build antar-fitur</text>

          {data.layers.map((layer) => {
            const layerNodes = data.nodes.filter((node) => node.layer === layer.index)
            const firstX = positions[layerNodes[0]?.feature.id]?.x ?? layerNodes[0]?.x ?? 84
            const centerX = firstX + data.nodeWidth / 2
            return (
              <g key={layer.index}>
                <line x1={centerX} y1={132} x2={centerX} y2={data.height - 62} stroke={palette.border} strokeWidth="1" strokeDasharray="3 7" opacity="0.7" />
                <rect x={centerX - 52} y={111} width={104} height={23} rx={11.5} fill={palette.surfaceRaised} stroke={palette.border} />
                <text x={centerX} y={126} textAnchor="middle" fill={palette.muted} fontSize="8" fontWeight="700" letterSpacing="0.9" fontFamily="Manrope, sans-serif">{layer.label.toUpperCase()} · {String(layer.count).padStart(2, '0')}</text>
              </g>
            )
          })}

          {data.edges.map((edge, index) => {
            const highlighted = relatedEdges.some((item) => item.from === edge.from && item.to === edge.to)
            const dimmed = Boolean(focusId) && !highlighted
            return (
              <path
                key={`${edge.from}-${edge.to}-${index}`}
                d={edgePath(edge.from, edge.to)}
                fill="none"
                stroke={highlighted ? palette.accent : palette.faint}
                strokeWidth={highlighted ? 1.9 : 1.25}
                strokeLinecap="round"
                markerEnd={highlighted ? 'url(#dep-arrow-accent)' : 'url(#dep-arrow)'}
                opacity={dimmed ? 0.2 : highlighted ? 0.95 : 0.5}
                style={{ transition: 'opacity 160ms ease, stroke 160ms ease' }}
              />
            )
          })}

          {data.nodes.map((node) => {
            const feature = node.feature
            const pos = getPos(feature.id, node.x, node.y)
            const isFocused = focusId === feature.id
            const isRelated = relatedNodeIds.has(feature.id)
            const dimmed = Boolean(focusId) && !isRelated
            const priorityColor = feature.priority === 'P0' ? palette.accent : feature.priority === 'P1' ? palette.amber : palette.green
            const textLines = wrapText(feature.name, 26, 2)
            const deps = feature.dependencies.length
            return (
              <g
                key={feature.id}
                data-graph-node
                opacity={dimmed ? 0.28 : 1}
                style={{ cursor: enabled ? 'grab' : 'default', transition: 'opacity 160ms ease' }}
                onPointerEnter={() => setHovered(feature.id)}
                onPointerLeave={() => setHovered(null)}
                onPointerDown={(event) => {
                  onSelectFeature?.(feature.id)
                  if (enabled) {
                    canvas.beginNodeDrag(event, pos, (next) => {
                      setPositions((current) => ({ ...current, [feature.id]: next }))
                    })
                  }
                }}
              >
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={data.nodeWidth}
                  height={data.nodeHeight}
                  rx={14}
                  fill={isFocused ? palette.surfaceRaised : palette.surface}
                  stroke={isFocused ? palette.accent : palette.border}
                  strokeWidth={isFocused ? 1.8 : 1}
                  filter={`url(#dep-shadow)`}
                />
                <rect x={pos.x + 1} y={pos.y + 16} width={3.2} height={data.nodeHeight - 32} rx={1.6} fill={priorityColor} />
                <text x={pos.x + 16} y={pos.y + 20} fill={palette.muted} fontSize="8.5" fontWeight="750" letterSpacing="0.7" fontFamily="Manrope, sans-serif">{feature.id}</text>
                <circle cx={pos.x + data.nodeWidth - 33} cy={pos.y + 16.5} r={3} fill={priorityColor} />
                <text x={pos.x + data.nodeWidth - 25} y={pos.y + 19.5} textAnchor="end" fill={priorityColor} fontSize="8.5" fontWeight="750" fontFamily="Manrope, sans-serif">{feature.priority}</text>
                <text fill={palette.text} fontSize="11.7" fontWeight="650" letterSpacing="-0.15" fontFamily="Manrope, sans-serif">
                  {textLines.map((line, index) => (
                    <tspan key={line} x={pos.x + 16} y={pos.y + (textLines.length > 1 ? 37 : 44) + index * 14.5}>{line}</tspan>
                  ))}
                </text>
                <text x={pos.x + 16} y={pos.y + data.nodeHeight - 12} fill={palette.faint} fontSize="8.1" fontWeight="550" fontFamily="Manrope, sans-serif">{deps > 0 ? `${deps} dependensi` : 'Titik awal'}</text>
                <text x={pos.x + data.nodeWidth - 14} y={pos.y + data.nodeHeight - 12} textAnchor="end" fill={palette.faint} fontSize="8.1" fontFamily="Manrope, sans-serif">{truncate(feature.phase.split('·')[0].trim(), 16)}</text>
              </g>
            )
          })}
          <text x={data.width - 24} y={data.height - 18} textAnchor="end" fill={palette.faint} fontSize="8.5" letterSpacing="1.1" fontFamily="Manrope, sans-serif">ADAPRD / DEPENDENCIES</text>
        </g>
      </svg>
      {!staticMode && (
        <DiagramControls
          zoom={canvas.view.k}
          onZoomIn={() => canvas.zoomBy(1.2)}
          onZoomOut={() => canvas.zoomBy(1 / 1.2)}
          onReset={canvas.reset}
        />
      )}
    </div>
  )
}
