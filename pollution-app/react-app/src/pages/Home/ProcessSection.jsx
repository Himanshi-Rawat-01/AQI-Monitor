import { useEffect, useRef } from 'react'
import useScrollReveal from '../../hooks/useScrollReveal'

const STEPS = [
  { num: '01', title: 'Select Your City', desc: 'Choose from 52+ Indian cities to get hyper-local AQI readings. Our network covers major metros and growing towns.' },
  { num: '02', title: 'Real-Time Data', desc: 'Air quality data refreshes continuously using OpenWeather API. See PM2.5, PM10, NO₂, SO₂, CO, and O₃ levels in real time.' },
  { num: '03', title: 'AI Analysis', desc: 'Our AI engine processes current and historical data to predict tomorrow\'s air quality and generate action plans.' },
  { num: '04', title: 'Take Action', desc: 'Receive personalized health recommendations, activity advisories, and air-quality alerts tailored to your city.' },
]

export default function ProcessSection() {
  const sectionRef = useScrollReveal({ threshold: 0.1 })
  const videoRef = useRef(null)
  const timelineRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) videoRef.current.play().catch(() => {})
  }, [])

  // Timeline progress on scroll
  useEffect(() => {
    const handleScroll = () => {
      const timeline = timelineRef.current
      if (!timeline) return
      const rect = timeline.getBoundingClientRect()
      const viewHeight = window.innerHeight
      const progress = Math.min(1, Math.max(0, (viewHeight - rect.top) / (rect.height + viewHeight * 0.3)))
      timeline.style.setProperty('--timeline-progress', progress)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="process-section" id="process" ref={sectionRef}>
      <video ref={videoRef} className="process-bg-video" autoPlay muted loop playsInline preload="none">
        <source src="/uploads/bg5.mp4" type="video/mp4" />
      </video>

      <div className="section-shell section-shell-plain">
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
