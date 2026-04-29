import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CONFIG from '../../config'

export default function HeroSection() {
  const heroRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Hero title - Immersive scale-up effect
      gsap.fromTo('.nature-title', 
        { scale: 1, opacity: 1, y: 0 },
        {
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: '+=600', // Faster completion
            scrub: 0.4,   // Reduced lag
          },
          scale: 1.2,
          opacity: 0,
          y: 60,
          ease: 'power1.inOut'
        }
      )

      // Hero description & badge - Recede effect
      gsap.fromTo(['.nature-desc', '.hero-badge', '.nature-buttons'],
        { scale: 1, opacity: 1, y: 0 },
        {
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: '+=500', 
            scrub: 0.3,
          },
          scale: 0.9,
          opacity: 0,
          y: 40,
          stagger: 0.05,
          ease: 'power1.inOut'
        }
      )
      // Magnetic Buttons Logic
      const magneticBtns = document.querySelectorAll('.magnetic-btn')
      magneticBtns.forEach(btn => {
        const content = btn.querySelector('.btn-content')
        
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect()
          const x = e.clientX - rect.left - rect.width / 2
          const y = e.clientY - rect.top - rect.height / 2
          
          gsap.to(btn, {
            x: x * 0.35,
            y: y * 0.35,
            duration: 0.4,
            ease: 'power2.out'
          })
          
          if (content) {
            gsap.to(content, {
              x: x * 0.15,
              y: y * 0.15,
              duration: 0.4,
              ease: 'power2.out'
            })
          }
        })
        
        btn.addEventListener('mouseleave', () => {
          gsap.to([btn, content], {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'elastic.out(1.1, 0.4)'
          })
        })
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section className="hero" id="hero" ref={heroRef}>

      <div className="nature-center" ref={contentRef}>
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
          <a 
            href={localStorage.getItem('aqi_token') || sessionStorage.getItem('aqi_token') ? CONFIG.DASHBOARD_URL : '/login'}
            onClick={(e) => {
              const token = localStorage.getItem('aqi_token') || sessionStorage.getItem('aqi_token');
              if (token) {
                e.preventDefault();
                window.location.assign(CONFIG.DASHBOARD_URL);
              }
            }}
            className="btn btn-primary magnetic-btn"
            style={{ textDecoration: 'none' }}
          >
            <span className="btn-content">
              <i className="fa fa-bolt btn-icon"></i> Start Monitoring
            </span>
          </a>
          <Link to="/register" className="btn btn-secondary magnetic-btn">
            <span className="btn-content">
              <i className="fa fa-arrow-right btn-icon"></i> Create Free Account
            </span>
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
