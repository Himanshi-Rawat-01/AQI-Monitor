import { useEffect, useRef } from 'react'

const N       = 40          // particle count (was 80)
const DIST_SQ = 130 * 130   // skip sqrt — compare squared distances

const PARTICLE_COLORS = [
  [16, 185, 129],
  [6,  182, 212],
  [52, 211, 153],
]

function makeParticle(w, h) {
  const c = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.38,
    vy: (Math.random() - 0.5) * 0.38,
    r: Math.random() * 1.6 + 0.7,
    c,
    a: Math.random() * 0.35 + 0.12,
  }
}

export default function AuthBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d', { alpha: false })
    let animId, w, h
    let particles = []

    const resize = () => {
      w = canvas.width  = window.innerWidth
      h = canvas.height = window.innerHeight
    }

    const init = () => {
      particles = Array.from({ length: N }, () => makeParticle(w, h))
    }

    const render = () => {
      // Single solid fill — no expensive gradient per frame
      ctx.fillStyle = '#040c18'
      ctx.fillRect(0, 0, w, h)

      // Connections — squared-distance avoids sqrt
      ctx.lineWidth = 0.7
      for (let i = 0; i < N - 1; i++) {
        const a = particles[i]
        for (let j = i + 1; j < N; j++) {
          const b  = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < DIST_SQ) {
            const t = 1 - d2 / DIST_SQ
            const [r, g, bl] = a.c
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(${r},${g},${bl},${(t * 0.18).toFixed(3)})`
            ctx.stroke()
          }
        }
      }

      // Particles
      for (let i = 0; i < N; i++) {
        const p = particles[i]
        p.x += p.vx;  p.y += p.vy
        if (p.x < 0)   { p.x = 0;  p.vx *= -1 }
        if (p.x > w)   { p.x = w;  p.vx *= -1 }
        if (p.y < 0)   { p.y = 0;  p.vy *= -1 }
        if (p.y > h)   { p.y = h;  p.vy *= -1 }

        const [r, g, bl] = p.c
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, 6.2832)
        ctx.fillStyle = `rgba(${r},${g},${bl},${p.a})`
        ctx.fill()
      }

      animId = requestAnimationFrame(render)
    }

    resize()
    init()
    render()

    const onResize = () => { resize(); init() }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        width: '100vw', height: '100vh',
        zIndex: 0, pointerEvents: 'none', display: 'block',
      }}
    />
  )
}
