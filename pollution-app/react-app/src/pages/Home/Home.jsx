import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ScrollToTop from '../../components/ScrollToTop'
import ScrollProgress from '../../components/ScrollProgress'
import HeroSection from './HeroSection'
import FeaturesSection from './FeaturesSection'
import ProcessSection from './ProcessSection'
import ControlSection from './ControlSection'

export default function Home({ setPlasmaColor }) {
  useEffect(() => {
    document.title = 'AQI Monitor — Real-Time Air Quality'
    document.body.classList.add('homepage-body')
    
    gsap.registerPlugin(ScrollTrigger)

    // Atmospheric Color Shifts
    const createColorTrigger = (trigger, color) => {
      ScrollTrigger.create({
        trigger: trigger,
        start: 'top 60%',
        onEnter: () => setPlasmaColor(color),
        onLeaveBack: () => {
          // Find prev section color
          const sections = ['#hero', '#features', '#process', '#control']
          const colors = ['#ffffff', '#26cc8a', '#ffcc33', '#5066ff']
          const idx = sections.indexOf(trigger)
          if (idx > 0) setPlasmaColor(colors[idx - 1])
        }
      })
    }

    createColorTrigger('#features', '#26cc8a')
    createColorTrigger('#process', '#ffcc33')
    createColorTrigger('#control', '#5066ff')

    return () => {
      document.body.classList.remove('homepage-body')
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [setPlasmaColor])

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
