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
    return () => document.body.classList.remove('homepage-body')
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
