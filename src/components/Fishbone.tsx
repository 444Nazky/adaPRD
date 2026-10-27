import { useEffect, useMemo, type RefObject } from 'react'
import type { PRD } from '../types'
import { getFishboneData } from '../lib/diagrams'
import { wrapText } from '../lib/utils'
import { DiagramControls, GraphDefs, graphPalette, usePanZoom } from './DiagramSurface'

const CHIP_WIDTH = 210
const CHIP_HEIGHT = 40

export function Fishbone({
  prd,
  svgRef,
  dark,
  staticMode = false,
  resetKey,
}: {
  prd: PRD
  svgRef: RefObject<SVGSVGElement | null>
  dark: boolean
  staticMode?: boolean
  resetKey?: number
}) {
  const data = useMemo(() => getFishboneData(prd), [prd])
  const palette = graphPalette(staticMode ? false : dark)
  const enabled = !staticMode
  const canvas = usePanZoom(data.width, data.height, svgRef, enabled)

  useEffect(() => {
    if (!resetKey) return
    canvas.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  const transform = enabled
    ? `translate(${data.width / 2 + canvas.view.x} ${data.height / 2 + canvas.view.y}) scale(${canvas.view.k}) translate(${-data.width / 2} ${-data.height / 2})`
    : undefined
  const problemLines = wrapText(prd.fishboneProblem || 'Mengapa produk belum mencapai hasil yang diharapkan?', 27, 4)

  return (
    <div className={`diagram-surface fishbone-surface ${staticMode ? 'is-static' : ''}`}>
      <svg
        ref={svgRef}
        className={`diagram-svg ${canvas.panning ? 'is-panning' : ''}`}
        viewBox={`0 0 ${data.width} ${data.height}`}
        role="img"
        aria-label="Diagram Ishikawa akar masalah"
        style={{ touchAction: 'none' }}
        {...(enabled ? canvas.handlers : {})}
      >
        <GraphDefs id="fish" palette={palette} dark={!staticMode && dark} />
        <defs>
          <radialGradient id="fish-glow">
            <stop offset="0%" stopColor={palette.accent} stopOpacity="0.11" />
            <stop offset="100%" stopColor={palette.accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={data.width} height={data.height} fill="url(#fish-dots)" />
        <rect width={data.width} height={data.height} fill={palette.bg} opacity="0.82" />
        <g transform={transform}>
          <circle cx={data.headX + 80} cy={data.spineY} r={240} fill="url(#fish-glow)" />
          <text x={70} y={92} fill={palette.muted} fontSize="9" fontWeight="700" letterSpacing="1.4" fontFamily="Manrope, sans-serif">ANALISIS AKAR MASALAH</text>
          <text x={70} y={112} fill={palette.text} fontSize="14" fontWeight="650" letterSpacing="-0.2" fontFamily="Manrope, sans-serif">Ishikawa / fishbone</text>
          <text x={70} y={132} fill={palette.faint} fontSize="9.5" fontFamily="Manrope, sans-serif">Diturunkan dari {data.groups.length} kategori risiko di PRD</text>

          <path d={`M ${data.headX} ${data.spineY} H 74`} stroke={palette.borderStrong} strokeWidth="2" strokeLinecap="round" />
          <path d={`M ${data.headX - 2} ${data.spineY} l -12 -7 v 14 z`} fill={palette.borderStrong} />
          <path d={`M 74 ${data.spineY} L 38 ${data.spineY - 58} L 38 ${data.spineY + 58} Z`} fill={palette.surfaceRaised} stroke={palette.borderStrong} strokeWidth="1.2" />
          <circle cx={76} cy={data.spineY} r={5} fill={palette.text} />

          {data.groups.map((group) => {
            const isTop = group.side === 'top'
            const slotIndex = isTop ? group.index : group.index - 3
            const slot = (isTop ? data.topSlots : data.bottomSlots)[slotIndex]
            if (!slot) return null
            const tipY = isTop ? data.topTipY : data.bottomTipY
            const boneCurve = isTop ? 18 : -18
            const bonePath = `M ${slot.baseX} ${data.spineY} C ${slot.baseX - 32} ${data.spineY + boneCurve}, ${slot.tipX + 28} ${tipY - boneCurve}, ${slot.tipX} ${tipY}`
            const tValues = [0.35, 0.68]
            return (
              <g key={group.id}>
                <path d={bonePath} fill="none" stroke={palette.borderStrong} strokeWidth="1.5" strokeLinecap="round" />
                <circle cx={slot.baseX} cy={data.spineY} r={3.4} fill={palette.accent} opacity="0.85" />
                <g>
                  <rect x={slot.tipX - 83} y={tipY - 17} width={166} height={34} rx={17} fill={palette.accentSoft} stroke={palette.accent} strokeOpacity="0.5" />
                  <circle cx={slot.tipX - 66} cy={tipY} r={3} fill={palette.accent} />
                  <text x={slot.tipX - 57} y={tipY + 4} fill={palette.accentInk} fontSize="10.5" fontWeight="750" letterSpacing="0.2" fontFamily="Manrope, sans-serif">{group.category}</text>
                </g>
                {group.causes.map((cause, causeIndex) => {
                  const t = tValues[causeIndex] ?? 0.5
                  const pointX = slot.baseX + (slot.tipX - slot.baseX) * t
                  const pointY = data.spineY + (tipY - data.spineY) * t
                  const chipX = pointX - CHIP_WIDTH - 18
                  const connectorStart = chipX + CHIP_WIDTH
                  const lines = wrapText(cause, 31, 2)
                  return (
                    <g key={`${group.id}-${causeIndex}`}>
                      <line x1={connectorStart} y1={pointY} x2={pointX - 3} y2={pointY} stroke={palette.borderStrong} strokeWidth="1" />
                      <circle cx={pointX} cy={pointY} r={2.4} fill={palette.faint} />
                      <rect
                        x={chipX}
                        y={pointY - CHIP_HEIGHT / 2}
                        width={CHIP_WIDTH}
                        height={CHIP_HEIGHT}
                        rx={8}
                        fill={palette.surface}
                        stroke={palette.border}
                        filter="url(#fish-soft-shadow)"
                      />
                      <rect x={chipX} y={pointY - CHIP_HEIGHT / 2 + 8} width={2.5} height={CHIP_HEIGHT - 16} rx={1.25} fill={causeIndex === 0 ? palette.accent : palette.borderStrong} />
                      <text fill={palette.text} fontSize="9.5" fontWeight="550" fontFamily="Manrope, sans-serif">
                        {lines.map((line, lineIndex) => (
                          <tspan key={line} x={chipX + 11} y={pointY - (lines.length - 1) * 5.5 + lineIndex * 12 + 3.4}>{line}</tspan>
                        ))}
                      </text>
                    </g>
                  )
                })}
              </g>
            )
          })}

          <g>
            <path
              d={`M ${data.headX} ${data.headY} H ${data.headX + 188} Q ${data.headX + 258} ${data.headY} ${data.headX + 258} ${data.headY + data.headHeight / 2} Q ${data.headX + 258} ${data.headY + data.headHeight} ${data.headX + 188} ${data.headY + data.headHeight} H ${data.headX} Z`}
              fill={palette.text}
              filter="url(#fish-shadow)"
            />
            <circle cx={data.headX + 24} cy={data.headY + 24} r={5} fill={palette.accent} />
            <text x={data.headX + 37} y={data.headY + 28} fill={palette.bg} opacity="0.62" fontSize="8" fontWeight="700" letterSpacing="1.2" fontFamily="Manrope, sans-serif">EFEK UTAMA</text>
            <text fill={palette.bg} fontSize="11.4" fontWeight="650" letterSpacing="-0.1" fontFamily="Manrope, sans-serif">
              {problemLines.map((line, index) => (
                <tspan key={line} x={data.headX + 24} y={data.headY + (problemLines.length > 2 ? 53 : 62) + index * 16}>{line}</tspan>
              ))}
            </text>
            <text x={data.headX + 24} y={data.headY + data.headHeight - 18} fill={palette.bg} opacity="0.52" fontSize="8.4" fontFamily="Manrope, sans-serif">Sumber: risiko & asumsi PRD</text>
          </g>
          <text x={data.width - 24} y={data.height - 18} textAnchor="end" fill={palette.faint} fontSize="8.5" letterSpacing="1.1" fontFamily="Manrope, sans-serif">ADAPRD / FISHBONE</text>
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
