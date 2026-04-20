import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = useCallback(() => setMenuOpen(prev => !prev), [])

  return (
    <nav className={`navbar${scrolled ? ' navbar-scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="nav-logo">
            <img src="/uploads/logo.png" alt="AirSense Logo" className="logo-icon" width="32" height="32" />
            <span className="logo-text">AQI Monitor</span>
          </Link>
        </div>
        <ul className={`nav-menu${menuOpen ? ' active' : ''}`} id="navMenu">
          <li className="nav-item"><Link to="/" className="nav-link">Home</Link></li>
          <li className="nav-item"><a href="/#features" className="nav-link">Features</a></li>
          <li className="nav-item"><a href="/#process" className="nav-link">Process</a></li>
          <li className="nav-item"><Link to="/login" className="btn-nav-cta">Log in</Link></li>
        </ul>
        <button className={`hamburger${menuOpen ? ' active' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  )
}
