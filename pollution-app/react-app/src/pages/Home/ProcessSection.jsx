import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const STEPS = [
  { num: '01', title: 'Select Your City', desc: 'Choose from 52+ Indian cities to get hyper-local AQI readings. Our network covers major metros and growing towns.' },
  { num: '02', title: 'Real-Time Data', desc: 'Air quality data refreshes continuously using OpenWeather API. See PM2.5, PM10, NO₂, SO₂, CO, and O₃ levels in real time.' },
  { num: '03', title: 'AI Analysis', desc: 'Our AI engine processes current and historical data to predict tomorrow\'s air quality and generate action plans.' },
  { num: '04', title: 'Take Action', desc: 'Receive personalized health recommendations, activity advisories, and air-quality alerts tailored to your city.' },
]

export default function ProcessSection() {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const videoRef = useRef(null)
  const timelineRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) videoRef.current.play().catch(() => {})
    
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Header Dynamic Scaling reveal
      if (headerRef.current) {
        gsap.fromTo(headerRef.current,
          { scale: 1.15, opacity: 0, y: 50, filter: 'blur(12px)' },
          {
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            },
            scale: 1,
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.4,
            ease: 'power3.out'
          }
        )
      }

      // Video Parallax
      gsap.to(videoRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        },
        y: 100,
        scale: 1.1,
        ease: 'none'
      })

      // Timeline Rail Progress
      gsap.to(timelineRef.current, {
        scrollTrigger: {
          trigger: timelineRef.current,
          start: 'top 85%',
          end: 'bottom 70%',
          scrub: 0.6, // Faster response
        },
        '--timeline-progress': 1,
        ease: 'none'
      })

      // Timeline Cards Reveal
      const cards = gsap.utils.toArray('.timeline-card')
      cards.forEach((card, i) => {
        gsap.fromTo(card, 
          { 
            opacity: 0, 
            scale: 0.85, 
            x: i % 2 === 0 ? -80 : 80,
            filter: 'blur(8px)'
          },
          {
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            },
            opacity: 1,
            scale: 1,
            x: 0,
            filter: 'blur(0px)',
            duration: 1.2,
            ease: 'power4.out',
            clearProps: 'all'
          }
        )
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section className="process-section" id="process" ref={sectionRef}>
      <video ref={videoRef} className="process-bg-video" autoPlay muted loop playsInline preload="none">
        <source src="/uploads/bg5.mp4" type="video/mp4" />
      </video>

      <div className="section-shell section-shell-plain" ref={headerRef}>
        <h2 className="section-title">How It Works</h2>
        <p className="section-intro">From selecting your city to receiving actionable insights — it takes less than 30 seconds.</p>
      </div>

      <div className="process-timeline" ref={timelineRef}>
        <div className="timeline-rail">
          <div className="timeline-rail-base"></div>
          <div className="timeline-rail-progress"></div>
        </div>

        {STEPS.map((step, i) => (
          <div key={i} className="timeline-card">
            <div className="process-step-orb">{step.num}</div>
            <div className="process-card">
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
