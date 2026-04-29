import { useState, useRef, useCallback, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const FEATURES = [
  { icon: 'fa-chart-line', title: 'Live AQI Dashboard', text: "See real-time air quality for your city, powered by OpenWeather API." },
  { icon: 'fa-wand-magic-sparkles', title: 'AI-Powered Forecasts', text: "Get tomorrow's AQI predictions using advanced analytics." },
  { icon: 'fa-heart-pulse', title: 'Health Guidance', text: 'Personalized tips to protect your health based on current air quality.' },
  { icon: 'fa-map-location-dot', title: '52+ Indian Cities', text: 'Comprehensive coverage across major cities, towns, and states in India.' },
  { icon: 'fa-bell', title: 'Smart Alerts', text: 'Instant notifications when air quality drops to unhealthy levels.' },
  { icon: 'fa-chart-area', title: 'Trend Analysis', text: '7-day historical trends with beautiful interactive charts and insights.' },
  { icon: 'fa-shield-halved', title: 'Health Shield', text: 'Activity recommendations based on real-time pollution conditions.' },
  { icon: 'fa-file-export', title: 'Export Reports', text: 'Download detailed PDF reports for records and offline analysis.' },
  { icon: 'fa-cloud-sun', title: 'Weather Integration', text: 'Combined weather and AQI data for complete environmental insight.' },
]

const CARDS_PER_VIEW = 3

export default function FeaturesSection() {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const gridRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardsPerView, setCardsPerView] = useState(CARDS_PER_VIEW)
  
  const totalPages = Math.ceil(FEATURES.length / CARDS_PER_VIEW)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger)
    }

    const ctx = gsap.context(() => {
      // Header Dynamic Scaling Entry
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

      // Feature cards - staggered fluid reveal
      const cards = gsap.utils.toArray('.feature-card')
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { y: 100, opacity: 0, rotationX: -15, scale: 0.9 },
          {
            scrollTrigger: {
              trigger: '.features-viewport',
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            },
            y: 0,
            opacity: 1,
            rotationX: 0,
            scale: 1,
            duration: 1.2,
            stagger: 0.12,
            ease: 'power4.out',
            clearProps: 'all'
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const goTo = useCallback((idx) => {
    const safeCardsPerView = cardsPerView || 1
    const clamped = Math.max(0, Math.min(idx, FEATURES.length - safeCardsPerView))
    setCurrentIndex(clamped)
  }, [cardsPerView])

  const currentPage = Math.floor(currentIndex / (cardsPerView || 1))

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setCardsPerView(1)
      else if (window.innerWidth <= 900) setCardsPerView(2)
      else setCardsPerView(3)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const translateX = -(currentIndex * (100 / (cardsPerView || 1)))

  return (
    <section className="features" id="features" ref={sectionRef}>
      <div className="section-shell section-shell-plain" ref={headerRef}>
        <h2 className="section-title">Everything You Need</h2>
        <p className="section-intro">Designed for daily use by students, families, and professionals who need clear air-quality insights without technical complexity.</p>
      </div>

      <div className="features-carousel">
        <div className="features-viewport perspective-container">
          <div
            className="features-grid"
            ref={gridRef}
            style={{ transform: `translateX(${translateX}%)` }}
          >
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`feature-card${i >= currentIndex && i < currentIndex + cardsPerView ? ' is-active-window' : ''}`}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = ((e.clientX - rect.left) / rect.width) * 100
                  const y = ((e.clientY - rect.top) / rect.height) * 100
                  e.currentTarget.style.setProperty('--mouse-x', `${x}%`)
                  e.currentTarget.style.setProperty('--mouse-y', `${y}%`)
                }}
              >
                <div className="feature-glare"></div>
                <div className="feature-icon-badge">
                  <i className={`fa ${f.icon}`}></i>
                </div>
                <h3 className="feature-heading">{f.title}</h3>
                <p className="feature-text">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          className="feature-nav feature-nav-prev"
          onClick={() => goTo(currentIndex - cardsPerView)}
          disabled={currentIndex === 0}
          aria-label="Previous features"
        >
          <i className="fa fa-chevron-left"></i>
        </button>

        <button
          className="feature-nav feature-nav-next"
          onClick={() => goTo(currentIndex + cardsPerView)}
          disabled={currentIndex >= FEATURES.length - cardsPerView}
          aria-label="Next features"
        >
          <i className="fa fa-chevron-right"></i>
        </button>

        <div className="feature-carousel-footer">
          <div className="feature-dots">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`feature-dot${i === currentPage ? ' active' : ''}`}
                onClick={() => goTo(i * CARDS_PER_VIEW)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <p className="feature-slide-meta">Slide {currentPage + 1} of {totalPages}</p>
        </div>
      </div>
    </section>
  )
}
