import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function HeroSection() {
  const videoRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }

    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (videoRef.current) {
             videoRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="hero" id="hero">
      <video
        ref={videoRef}
        className={`hero-video-bg ${isLoaded ? 'video-loaded' : ''}`}
        autoPlay muted loop playsInline
        preload="auto"
        onLoadedData={() => setIsLoaded(true)}
      >
        <source src="/uploads/bg1.mp4" type="video/mp4" />
      </video>

      <div className="nature-center">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          REAL-TIME AIR QUALITY MONITORING
        </div>

        <h1 className="nature-title">
          <span className="hero-title-accent">Breathe Better</span> With AirSense
        </h1>

        <p className="nature-desc">
          Professional air quality monitoring with real-time tracking, guided action plans, and data-backed daily forecasts.
        </p>

        <div className="nature-buttons">
          <Link to="/login" className="btn btn-primary">
            <i className="fa fa-bolt btn-icon"></i> Start Monitoring
          </Link>
          <Link to="/register" className="btn btn-secondary">
            <i className="fa fa-arrow-right btn-icon"></i> Create Free Account
          </Link>
        </div>

        <div className="hero-features-row">
          <div className="hero-feature-item">
            <i className="fa fa-check-circle feature-icon"></i> 100% Free
          </div>
          <div className="hero-feature-item">
            <i className="fa fa-clock feature-icon"></i> Real-Time Data
          </div>
          <div className="hero-feature-item">
            <i className="fa fa-wand-magic-sparkles feature-icon"></i> AI-Powered
          </div>
        </div>
      </div>

      <a href="#features" className="scroll-cue" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) }}>
        <span>Scroll</span>
        <i className="fa fa-chevron-down"></i>
      </a>
    </section>
  )
}
