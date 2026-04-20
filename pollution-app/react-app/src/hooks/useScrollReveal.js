import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function useScrollReveal(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Simple reveal logic using IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in', 'in-view')
          }
        })
      },
      { threshold: options.threshold || 0.1, rootMargin: options.rootMargin || '0px' }
    )

    const targets = el.querySelectorAll('.scroll-animate, .timeline-card, .control-list li')
    targets.forEach((t) => observer.observe(t))

    if (el.classList.contains('scroll-animate')) {
      observer.observe(el)
    }

    return () => {
      observer.disconnect()
      // Kill any ScrollTriggers associated with this component on unmount
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === el || el.contains(st.trigger)) {
          st.kill()
        }
      })
    }
  }, [options.threshold, options.rootMargin])

  return ref
}
