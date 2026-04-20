import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const INDIVIDUAL_TIPS = [
  'Use public transport, carpool, or cycle when possible.',
  'Avoid outdoor workouts during peak traffic hours.',
  'Keep indoor air clean with ventilation and filtration.',
  'Track local AQI before planning school, work, or travel.',
]

const COMMUNITY_TIPS = [
  'Strengthen emission surveillance and penalize violating industries.',
  'Scale clean energy adoption and dust-control measures.',
  'Increase urban green cover and monitor pollution hotspots.',
  'Use open air-quality data for transparent governance.',
]

export default function ControlSection() {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const panelsRef = useRef(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Header Dynamic Scaling
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 95%',
            end: 'top 60%',
            scrub: 0.4 // Faster response
          },
          scale: 1.3,
          opacity: 0,
          y: 30,
          ease: 'power2.out'
        })
      }

      // Bi-lateral Panels Reveal
      if (panelsRef.current) {
        const panels = panelsRef.current.children
        
        // Left Panel (Individual)
        gsap.from(panels[0], {
          scrollTrigger: {
            trigger: panelsRef.current,
            start: 'top 85%',
          },
          x: -100,
          opacity: 0,
          duration: 1.2,
          ease: 'power4.out'
        })

        // Right Panel (Community)
        gsap.from(panels[1], {
          scrollTrigger: {
            trigger: panelsRef.current,
            start: 'top 85%',
          },
          x: 100,
          opacity: 0,
          duration: 1.2,
          ease: 'power4.out'
        })

        // List Staggering
        gsap.fromTo('.control-list li', 
          { opacity: 0, y: 30 },
          {
            scrollTrigger: {
              trigger: panelsRef.current,
              start: 'top 75%',
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'back.out(1.2)',
            clearProps: 'all'
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="control-section" id="control" ref={sectionRef}>
      <div className="section-shell section-shell-plain" ref={headerRef}>
        <h2 className="section-title">Control AQI</h2>
        <p className="section-intro">Actions you and your community can take today to improve air quality.</p>
      </div>

      <div className="control-layout" ref={panelsRef}>
        <div className="control-panel">
          <h3>Individual Actions</h3>
          <ol className="control-list">
            {INDIVIDUAL_TIPS.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ol>
        </div>
        <div className="control-panel">
          <h3>Community & Policy</h3>
          <ol className="control-list">
            {COMMUNITY_TIPS.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
