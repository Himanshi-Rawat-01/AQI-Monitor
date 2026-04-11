import { useEffect, useRef } from 'react'

export default function useScrollReveal(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in', 'in-view')
          }
        })
      },
      { threshold: options.threshold || 0.15, rootMargin: options.rootMargin || '0px' }
    )

    const targets = el.querySelectorAll('.scroll-animate, .timeline-card, .control-list li')
    targets.forEach((t) => observer.observe(t))

    // Also observe the element itself if it has the class
    if (el.classList.contains('scroll-animate')) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [options.threshold, options.rootMargin])

  return ref
}
