import { useEffect, useMemo, useState, type RefObject } from 'react'
import type { FlowNode, PRD } from '../types'
import { getFlowData, flowLabelLines } from '../lib/diagrams'
import { DiagramControls, GraphDefs, graphPalette, usePanZoom } from './DiagramSurface'

type Positions = Record<string, { x: number; y: number }>

export function Flowchart({
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
  const data = useMemo(() => getFlowData(prd), [prd])
  const palette = graphPalette(staticMode ? false : dark)
  const enabled = !staticMode
  const canvas = usePanZoom(data.width, data.height, svgRef, enabled)
  const initialPositions = useMemo(() => Object.fromEntries(data.nodes.map((node) => [node.id, { x: node.x, y: node.y }])) as Positions, [data])
  const [positions, setPositions] = useState<Positions>(initialPositions)
  const [hovered, setHovered] = useState<string | null>(null)
  const layoutKey = data.nodes.map((node) => `${node.id}:${node.label}`).join('|')

  useEffect(() => {
    setPositions(initialPositions)
  }, [layoutKey, initialPositions])

  useEffect(() => {
    if (!resetKey) return
    setPositions(initialPositions)
    canvas.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  const findNode = (id: string) => data.nodes.find((node) => node.id === id)
  const getPosition = (node: FlowNode) => ({ ...node, ...(positions[node.id] ?? { x: node.x, y: node.y }) })
  const focusNode = hovered ?? data.nodes.find((node) => node.featureId === selectedFeatureId)?.id ?? null
  const connectedEdges = focusNode ? data.edges.filter((edge) => edge.from === focusNode || edge.to === focusNode) : []
  const connectedNodeIds = new Set(connectedEdges.flatMap((edge) => [edge.from, edge.to]).concat(focusNode ?? []))

  const edgePath = (edgeId: string) => {
    const edge = data.edges.find((item) => item.id === edgeId)
    if (!edge) return { path: '', labelX: 0, labelY: 0 }
    const from = getPosition(findNode(edge.from)!)
    const to = getPosition(findNode(edge.to)!)
    const sourceX = from.x + from.width
    const sourceY = from.y + from.height / 2
    const targetX = to.x
    const targetY = to.y + to.height / 2
    const curve = Math.max(42, Math.abs(targetX - sourceX) * 0.52)
    return {
      path: `M ${sourceX} ${sourceY} C ${sourceX + curve} ${sourceY}, ${targetX - curve} ${targetY}, ${targetX} ${targetY}`,
      labelX: (sourceX + targetX) / 2,
      labelY: (sourceY + targetY) / 2 - 10,
    }
  }

  const transform = enabled
    ? `translate(${data.width / 2 + canvas.view.x} ${data.height / 2 + canvas.view.y}) scale(${canvas.view.k}) translate(${-data.width / 2} ${-data.height / 2})`
    : undefined

  return (
    <div className={`diagram-surface flow-surface ${staticMode ? 'is-static' : ''}`}>
      <svg
        ref={svgRef}
        className={`diagram-svg ${canvas.panning ? 'is-panning' : ''}`}
        viewBox={`0 0 ${data.width} ${data.height}`}
        role="img"
        aria-label="Flowchart alur sistem"
        style={{ touchAction: 'none' }}
        {...(enabled ? canvas.handlers : {})}
      >
        <GraphDefs id="flow" palette={palette} dark={!staticMode && dark} />
        <rect width={data.width} height={data.height} fill={`url(#flow-dots)`} />
        <rect width={data.width} height={data.height} fill={palette.bg} opacity="0.84" />
        <g transform={transform}>
          <path d="M 0 0 H 0" fill="none" />
          {data.edges.map((edge) => {
            const { path, labelX, labelY } = edgePath(edge.id)
            const highlighted = connectedEdges.some((item) => item.id === edge.id)
            return (
              <g key={edge.id} className="flow-edge">
                <path
                  d={path}
                  fill="none"
                  stroke={highlighted ? palette.accent : palette.faint}
                  strokeWidth={highlighted ? 1.8 : 1.35}
                  strokeDasharray={edge.kind === 'no' ? '5 5' : undefined}
                  markerEnd={`url(#${highlighted ? 'flow-arrow-accent' : 'flow-arrow'})`}
                  opacity={focusNode && !highlighted ? 0.35 : 1}
                  style={{ transition: 'opacity 160ms ease, stroke 160ms ease' }}
                />
                {edge.label && (
                  <g opacity={focusNode && !highlighted ? 0.35 : 1}>
                    <rect
                      x={labelX - (edge.label.length * 3.4 + 12)}
                      y={labelY - 12}
                      width={edge.label.length * 6.8 + 24}
                      height={22}
                      rx={11}
                      fill={edge.kind === 'yes' ? palette.greenSoft : palette.accentSoft}
                      stroke={edge.kind === 'yes' ? palette.green : palette.accent}
                      strokeOpacity={0.45}
                    />
                    <text x={labelX} y={labelY + 3.5} textAnchor="middle" fill={edge.kind === 'yes' ? palette.green : palette.accent} fontSize="9" fontWeight="700" fontFamily="Manrope, sans-serif">
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {data.nodes.map((rawNode) => {
            const node = getPosition(rawNode)
            const lines = flowLabelLines(node)
            const isFocused = focusNode === node.id
            const dimmed = focusNode && !connectedNodeIds.has(node.id)
            const selected = Boolean(rawNode.featureId && rawNode.featureId === selectedFeatureId)
            const feature = rawNode.featureId ? prd.features.find((item) => item.id === rawNode.featureId) : undefined
            const accent = feature?.priority === 'P0' ? palette.accent : feature?.priority === 'P1' ? palette.amber : palette.green
            const textStart = node.type === 'process' ? node.y + (lines.length > 1 ? 39 : 45) : node.y + node.height / 2 + 4
            return (
              <g
                key={node.id}
                data-graph-node
                className="flow-node"
                opacity={dimmed ? 0.36 : 1}
                style={{ cursor: enabled ? 'grab' : 'default', transition: 'opacity 160ms ease' }}
                onPointerEnter={() => setHovered(node.id)}
                onPointerLeave={() => setHovered(null)}
                onPointerDown={(event) => {
                  if (rawNode.featureId) onSelectFeature?.(rawNode.featureId)
                  if (enabled) {
                    canvas.beginNodeDrag(event, { x: node.x, y: node.y }, (next) => {
                      setPositions((current) => ({ ...current, [node.id]: next }))
                    })
                  }
                }}
              >
                {node.type === 'process' && (
                  <>
                    <rect
                      x={node.x}
                      y={node.y}
                      width={node.width}
                      height={node.height}
                      rx={13}
                      fill={palette.surface}
                      stroke={isFocused || selected ? palette.accent : palette.border}
                      strokeWidth={isFocused || selected ? 1.6 : 1}
                      filter={`url(#flow-shadow)`}
                    />
                    <rect x={node.x} y={node.y + 14} width={3} height={node.height - 28} rx={1.5} fill={accent} />
                    <circle cx={node.x + 17} cy={node.y + 16} r={3.2} fill={accent} />
                    <text x={node.x + 26} y={node.y + 19} fill={palette.muted} fontSize="8.5" fontWeight="700" letterSpacing="0.7" fontFamily="Manrope, sans-serif">
                      {feature?.id ?? `STEP ${rawNode.id.toUpperCase()}`}
                    </text>
                    <text x={node.x + node.width - 13} y={node.y + 19} textAnchor="end" fill={palette.muted} fontSize="8" fontWeight="600" fontFamily="Manrope, sans-serif">
                      {feature?.phase?.split('·')[0]?.trim().toUpperCase() ?? 'FLOW'}
                    </text>
                    <text fill={palette.text} fontSize="12.2" fontWeight="650" fontFamily="Manrope, sans-serif" letterSpacing="-0.15">
                      {lines.map((line, index) => (
                        <tspan key={line} x={node.x + 16} y={textStart + index * 16}>{line}</tspan>
                      ))}
                    </text>
                  </>
                )}
                {node.type === 'decision' && (
                  <>
                    <path
                      d={`M ${node.x + node.width / 2} ${node.y} L ${node.x + node.width} ${node.y + node.height / 2} L ${node.x + node.width / 2} ${node.y + node.height} L ${node.x} ${node.y + node.height / 2} Z`}
                      fill={isFocused ? palette.accentSoft : palette.surfaceRaised}
                      stroke={isFocused ? palette.accent : palette.borderStrong}
                      strokeWidth={isFocused ? 1.8 : 1.1}
                      filter="url(#flow-soft-shadow)"
                    />
                    <text x={node.x + node.width / 2} y={node.y + node.height / 2 - 18} textAnchor="middle" fill={palette.accent} fontSize="7.8" fontWeight="800" letterSpacing="1" fontFamily="Manrope, sans-serif">DECISION</text>
                    {lines.map((line, index) => (
                      <text key={line} x={node.x + node.width / 2} y={node.y + node.height / 2 - 1 + index * 15} textAnchor="middle" fill={palette.text} fontSize="11.5" fontWeight="650" fontFamily="Manrope, sans-serif">
                        {line}
                      </text>
                    ))}
                  </>
                )}
                {(node.type === 'start' || node.type === 'end') && (
                  <>
                    <rect
                      x={node.x}
                      y={node.y}
                      width={node.width}
                      height={node.height}
                      rx={node.height / 2}
                      fill={node.type === 'start' ? palette.text : palette.accent}
                      stroke={node.type === 'start' ? palette.text : palette.accent}
                      filter="url(#flow-shadow)"
                    />
                    <circle cx={node.x + 24} cy={node.y + node.height / 2} r={4.5} fill={node.type === 'start' ? palette.accent : '#fff6ef'} />
                    <text x={node.x + 38} y={node.y + node.height / 2 + 4.5} fill={node.type === 'start' ? palette.bg : '#fffaf5'} fontSize="11.5" fontWeight="700" fontFamily="Manrope, sans-serif">
                      {node.label}
                    </text>
                  </>
                )}
              </g>
            )
          })}

          <text x={data.width - 28} y={data.height - 20} textAnchor="end" fill={palette.faint} fontSize="8.5" letterSpacing="1.1" fontFamily="Manrope, sans-serif">ADAPRD / LIVE FLOW</text>
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
