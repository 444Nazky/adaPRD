import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { Minus, Move, Plus, RotateCcw } from 'lucide-react'

export type CanvasView = { x: number; y: number; k: number }

export type GraphPalette = ReturnType<typeof graphPalette>

export function graphPalette(dark: boolean) {
  return dark
    ? {
        bg: '#171411',
        dots: '#3a342d',
        surface: '#211d19',
        surfaceRaised: '#29241f',
        border: '#3d362e',
        borderStrong: '#554b3f',
        text: '#f6f1e8',
        muted: '#aa9e8c',
        faint: '#73685a',
        accent: '#ff7a55',
        accentSoft: '#3c261e',
        accentInk: '#ffd9ca',
        green: '#a8bf99',
        greenSoft: '#263124',
        amber: '#e2b366',
        amberSoft: '#352b1d',
        shadow: '#000000',
      }
    : {
        bg: '#faf7f0',
        dots: '#ddd3c4',
        surface: '#fffdf9',
        surfaceRaised: '#fff8ee',
        border: '#e6ddd0',
        borderStrong: '#d4c7b5',
        text: '#211d18',
        muted: '#887b6c',
        faint: '#b3a695',
        accent: '#ef5a35',
        accentSoft: '#fff0e8',
        accentInk: '#8b2f18',
        green: '#78936a',
        greenSoft: '#eef4ea',
        amber: '#b38443',
        amberSoft: '#f8efdf',
        shadow: '#a89783',
      }
}

export function usePanZoom(width: number, height: number, svgRef: RefObject<SVGSVGElement | null>, enabled: boolean) {
  const [view, setView] = useState<CanvasView>({ x: 0, y: 0, k: 1 })
  const [panning, setPanning] = useState(false)
  const panState = useRef<{ startX: number; startY: number; view: CanvasView } | null>(null)

  const toSvgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const point = svg.createSVGPoint()
    point.x = clientX
    point.y = clientY
    const matrix = svg.getScreenCTM()
    if (!matrix) return { x: 0, y: 0 }
    return point.matrixTransform(matrix.inverse())
  }, [svgRef])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || !enabled) return
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const factor = Math.exp(-event.deltaY * 0.0014)
      const anchor = toSvgPoint(event.clientX, event.clientY)
      setView((current) => {
        const nextK = Math.min(5, Math.max(0.42, current.k * factor))
        const contentX = (anchor.x - width / 2 - current.x) / current.k + width / 2
        const contentY = (anchor.y - height / 2 - current.y) / current.k + height / 2
        return {
          k: nextK,
          x: anchor.x - width / 2 - (contentX - width / 2) * nextK,
          y: anchor.y - height / 2 - (contentY - height / 2) * nextK,
        }
      })
    }
    svg.addEventListener('wheel', handleWheel, { passive: false })
    return () => svg.removeEventListener('wheel', handleWheel)
  }, [enabled, height, svgRef, toSvgPoint, width])

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!enabled || event.button !== 0) return
    const target = event.target as Element
    if (target.closest('[data-graph-node]')) return
    const point = toSvgPoint(event.clientX, event.clientY)
    panState.current = { startX: point.x, startY: point.y, view }
    event.currentTarget.setPointerCapture(event.pointerId)
    setPanning(true)
  }

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!panState.current) return
    const point = toSvgPoint(event.clientX, event.clientY)
    const deltaX = point.x - panState.current.startX
    const deltaY = point.y - panState.current.startY
    setView({ ...panState.current.view, x: panState.current.view.x + deltaX, y: panState.current.view.y + deltaY })
  }

  const endPan = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (panState.current) {
      panState.current = null
      setPanning(false)
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const zoomBy = (factor: number) => {
    setView((current) => ({ ...current, k: Math.min(5, Math.max(0.42, current.k * factor)) }))
  }

  const reset = () => setView({ x: 0, y: 0, k: 1 })

  const beginNodeDrag = (
    event: ReactPointerEvent<SVGGElement | SVGCircleElement>,
    position: { x: number; y: number },
    onMove: (next: { x: number; y: number }) => void,
    onDone?: () => void,
  ) => {
    if (!enabled) return
    event.stopPropagation()
    event.preventDefault()
    const start = toSvgPoint(event.clientX, event.clientY)
    let moved = false
    const move = (moveEvent: PointerEvent) => {
      const point = toSvgPoint(moveEvent.clientX, moveEvent.clientY)
      const deltaX = (point.x - start.x) / view.k
      const deltaY = (point.y - start.y) / view.k
      if (Math.abs(deltaX) + Math.abs(deltaY) > 1) moved = true
      onMove({ x: position.x + deltaX, y: position.y + deltaY })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      if (moved) onDone?.()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return {
    view,
    panning,
    zoomBy,
    reset,
    beginNodeDrag,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPan,
      onPointerCancel: endPan,
    },
  }
}

export function DiagramControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}) {
  return (
    <div className="diagram-controls">
      <div className="diagram-hint">
        <Move size={12} />
        <span className="hint-desktop">Geser kanvas · scroll untuk zoom</span>
        <span className="hint-mobile">Geser · + untuk zoom</span>
      </div>
      <div className="zoom-controls">
        <button type="button" onClick={onZoomOut} title="Perkecil" aria-label="Perkecil diagram"><Minus size={14} /></button>
        <span>{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={onZoomIn} title="Perbesar" aria-label="Perbesar diagram"><Plus size={14} /></button>
        <span className="zoom-divider" />
        <button type="button" onClick={onReset} title="Reset tampilan" aria-label="Reset tampilan"><RotateCcw size={13} /></button>
      </div>
    </div>
  )
}

export function GraphDefs({
  id,
  palette,
  dark,
}: {
  id: string
  palette: GraphPalette
  dark: boolean
}) {
  return (
    <defs>
      <pattern id={`${id}-dots`} width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="1.5" cy="1.5" r="1" fill={palette.dots} opacity={dark ? 0.65 : 0.75} />
      </pattern>
      <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor={palette.shadow} floodOpacity={dark ? 0.26 : 0.08} />
      </filter>
      <filter id={`${id}-soft-shadow`} x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="3" floodColor={palette.shadow} floodOpacity={dark ? 0.18 : 0.05} />
      </filter>
      <marker id={`${id}-arrow`} markerWidth="9" markerHeight="9" refX="7.4" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M 1 1 L 8 4.5 L 1 8" fill="none" stroke={palette.faint} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </marker>
      <marker id={`${id}-arrow-accent`} markerWidth="9" markerHeight="9" refX="7.4" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M 1 1 L 8 4.5 L 1 8" fill="none" stroke={palette.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </marker>
    </defs>
  )
}
