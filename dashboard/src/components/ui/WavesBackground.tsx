import { useEffect, useRef } from 'react'

/** Draws a restrained amber wave field behind the hero without image assets. */
export function WavesBackground(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const context = canvas.getContext('2d')
    if (!context) return undefined
    let frame = 0
    let animation = 0
    const resize = () => { canvas.width = window.innerWidth * window.devicePixelRatio; canvas.height = window.innerHeight * window.devicePixelRatio; context.scale(window.devicePixelRatio, window.devicePixelRatio) }
    const draw = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      context.clearRect(0, 0, width, height)
      context.strokeStyle = 'rgba(217, 164, 65, 0.16)'
      context.lineWidth = 1
      for (let y = -height; y < height * 1.5; y += 36) {
        context.beginPath()
        for (let x = -20; x < width + 20; x += 12) context.lineTo(x, y + Math.sin(x * 0.008 + frame * 0.004) * 28 + Math.cos(y * 0.004 + frame * 0.002) * 12)
        context.stroke()
      }
      frame += 1
      animation = window.requestAnimationFrame(draw)
    }
    resize(); draw(); window.addEventListener('resize', resize)
    return () => { window.cancelAnimationFrame(animation); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 z-0 h-full w-full opacity-70" />
}
