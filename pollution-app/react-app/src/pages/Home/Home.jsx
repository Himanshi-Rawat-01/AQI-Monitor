import { useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ScrollToTop from '../../components/ScrollToTop'
import ScrollProgress from '../../components/ScrollProgress'
import HeroSection from './HeroSection'
import FeaturesSection from './FeaturesSection'
import ProcessSection from './ProcessSection'
import ControlSection from './ControlSection'

export default function Home() {
  useEffect(() => {
    document.title = 'AQI Monitor — Real-Time Air Quality'
    document.body.classList.add('homepage-body')

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-in-view')
        }
      })
    }, { threshold: 0.15 })

    const sections = document.querySelectorAll('section')
    sections.forEach(sec => observer.observe(sec))

    return () => {
      document.body.classList.remove('homepage-body')
      observer.disconnect()
    }
  }, [])

  return (
    <div className="homepage">
      <ScrollProgress />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ProcessSection />
      <ControlSection />
      <Footer />
      <ScrollToTop />
    </div>
  )
}
