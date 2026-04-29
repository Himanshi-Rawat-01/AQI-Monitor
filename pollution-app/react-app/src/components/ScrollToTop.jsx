import { useState, useEffect } from 'react'

export default function ScrollToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <button className={`scroll-to-top${show ? ' show' : ''}`} onClick={scrollToTop} aria-label="Scroll to top">
      <i className="fa fa-angle-up"></i>
    </button>
  )
}
