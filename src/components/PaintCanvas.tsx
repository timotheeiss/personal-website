import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'

interface Point {
  x: number
  y: number
}

interface Stroke {
  color: string
  size: number
  points: Point[]
}

interface PaintCanvasProps {
  enabled: boolean
  color: string
  brushSize: number
}

function drawDot(context: CanvasRenderingContext2D, point: Point, color: string, size: number) {
  context.beginPath()
  context.fillStyle = color
  context.arc(point.x, point.y, size / 2, 0, Math.PI * 2)
  context.fill()
}

function drawSegment(
  context: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  color: string,
  size: number,
) {
  context.beginPath()
  context.moveTo(from.x, from.y)
  context.lineTo(to.x, to.y)
  context.strokeStyle = color
  context.lineWidth = size
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.stroke()
}

function redraw(context: CanvasRenderingContext2D, strokes: Stroke[]) {
  for (const stroke of strokes) {
    if (stroke.points.length === 1) {
      drawDot(context, stroke.points[0], stroke.color, stroke.size)
      continue
    }

    for (let index = 1; index < stroke.points.length; index += 1) {
      drawSegment(context, stroke.points[index - 1], stroke.points[index], stroke.color, stroke.size)
    }
  }
}

export function PaintCanvas({ enabled, color, brushSize }: PaintCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokesRef = useRef<Stroke[]>([])
  const activeStrokeRef = useRef<Stroke | null>(null)

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const shell = canvas?.parentElement
    if (!canvas || !shell) return

    const width = Math.ceil(Math.max(shell.scrollWidth, document.documentElement.clientWidth))
    const height = Math.ceil(Math.max(shell.scrollHeight, document.documentElement.clientHeight))
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    const nextWidth = Math.round(width * pixelRatio)
    const nextHeight = Math.round(height * pixelRatio)

    if (canvas.width === nextWidth && canvas.height === nextHeight) return

    canvas.width = nextWidth
    canvas.height = nextHeight
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const context = canvas.getContext('2d')
    if (!context) return

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    redraw(context, strokesRef.current)
  }, [])

  useEffect(() => {
    resizeCanvas()
    const shell = canvasRef.current?.parentElement
    const observer = shell ? new ResizeObserver(resizeCanvas) : null
    if (shell) observer?.observe(shell)
    window.addEventListener('resize', resizeCanvas)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [resizeCanvas])

  const getPoint = (event: ReactPointerEvent<HTMLCanvasElement>): Point => {
    const bounds = event.currentTarget.getBoundingClientRect()
    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    }
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!enabled || event.button !== 0) return
    event.preventDefault()
    resizeCanvas()
    event.currentTarget.setPointerCapture(event.pointerId)

    const point = getPoint(event)
    const stroke = { color, size: brushSize, points: [point] }
    strokesRef.current.push(stroke)
    activeStrokeRef.current = stroke

    const context = event.currentTarget.getContext('2d')
    if (context) drawDot(context, point, color, brushSize)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const stroke = activeStrokeRef.current
    if (!enabled || !stroke) return
    event.preventDefault()

    const point = getPoint(event)
    const previousPoint = stroke.points[stroke.points.length - 1]
    stroke.points.push(point)

    const context = event.currentTarget.getContext('2d')
    if (context) drawSegment(context, previousPoint, point, stroke.color, stroke.size)
  }

  const finishStroke = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    activeStrokeRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <canvas
      ref={canvasRef}
      className={`paint-canvas${enabled ? ' paint-canvas--enabled' : ''}`}
      aria-hidden="true"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishStroke}
      onPointerCancel={finishStroke}
    />
  )
}
