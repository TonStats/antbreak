'use client'

import { useEffect, useRef } from 'react'

const COLORS = ['#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#60a5fa', '#e879f9', '#fb923c']

interface Particle {
  x: number; y: number; vx: number; vy: number
  color: string; w: number; h: number; rotation: number; rotSpeed: number
}

export default function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active || !canvasRef.current) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    canvas.width  = rect.width  || 400
    canvas.height = rect.height || 400
    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const H = canvas.height

    const particles: Particle[] = Array.from({ length: 90 }, () => ({
      x:        Math.random() * W,
      y:        Math.random() * -H * 0.6,
      vx:       (Math.random() - 0.5) * 3,
      vy:       Math.random() * 2 + 1.5,
      color:    COLORS[Math.floor(Math.random() * COLORS.length)],
      w:        Math.random() * 10 + 5,
      h:        Math.random() * 5 + 3,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.12,
    }))

    const start = Date.now()
    const DURATION = 3500
    let raf: number

    function frame() {
      const elapsed = Date.now() - start
      if (elapsed > DURATION) { ctx.clearRect(0, 0, W, H); return }

      ctx.clearRect(0, 0, W, H)
      const alpha = elapsed < DURATION * 0.7 ? 1 : 1 - (elapsed - DURATION * 0.7) / (DURATION * 0.3)

      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.rotation += p.rotSpeed
        if (p.y > H + 20) { p.y = -10; p.x = Math.random() * W; p.vy = Math.random() * 2 + 1.5 }
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }

      raf = requestAnimationFrame(frame)
    }

    frame()
    return () => cancelAnimationFrame(raf)
  }, [active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full rounded-2xl"
    />
  )
}
