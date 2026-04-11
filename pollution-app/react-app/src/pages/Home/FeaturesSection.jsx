import { useState, useRef, useCallback, useEffect } from 'react'
import useScrollReveal from '../../hooks/useScrollReveal'

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
  const sectionRef = useScrollReveal({ threshold: 0.15 })
  const [currentIndex, setCurrentIndex] = useState(0)
  const gridRef = useRef(null)
  const totalPages = Math.ceil(FEATURES.length / CARDS_PER_VIEW)

  const goTo = useCallback((idx) => {
    const clamped = Math.max(0, Math.min(idx, FEATURES.length - CARDS_PER_VIEW))
    setCurrentIndex(clamped)
  }, [])

  const currentPage = Math.floor(currentIndex / CARDS_PER_VIEW)

  // Calculate responsive cards per view
  const [cardsPerView, setCardsPerView] = useState(CARDS_PER_VIEW)
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

  const translateX = -(currentIndex * (100 / cardsPerView))

  return (
    <section className="features" id="features" ref={sectionRef}>
      <div className="section-shell section-shell-plain scroll-animate fade-in-up">
        <h2 className="section-title">Everything You Need</h2>
        <p className="section-intro">Designed for daily use by students, families, and professionals who need clear air-quality insights without technical complexity.</p>
      </div>

      <div className="features-carousel scroll-animate fade-in-up delay-200">
        <div className="features-viewport">
          <div
            className="features-grid"
            ref={gridRef}
            style={{ transform: `translateX(${translateX}%)` }}
          >
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`feature-card${i >= currentIndex && i < currentIndex + cardsPerView ? ' is-active-window' : ''}`}
              >
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
