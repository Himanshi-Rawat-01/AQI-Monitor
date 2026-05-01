import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function SmoothScroll({ children }) {
  useEffect(() => {
    // Safety: Ensure we are in the browser
    if (typeof window === 'undefined') return

    // Disable smooth scroll on mobile for better performance and native feel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    if (isMobile) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
      autoRaf: true
    })

    // Sync Lenis scroll with GSAP ScrollTrigger
    lenis.on('scroll', () => {
      ScrollTrigger.update()
    })

    const update = (time) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    // Ensure ScrollTrigger is ready
    setTimeout(() => {
      ScrollTrigger.refresh()
    }, 100)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(update)
    }
  }, [])

  return <>{children}</>
}

