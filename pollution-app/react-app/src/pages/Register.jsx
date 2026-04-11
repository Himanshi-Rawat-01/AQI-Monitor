import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CONFIG from '../config'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('')
  const [terms, setTerms] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!name) errs.name = 'Name is required.'
    if (!email) errs.email = 'Email is required.'
    if (!password || password.length < 6) errs.password = 'Password must be at least 6 characters.'
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.'
    if (!role) errs.role = 'Please select a role.'
    if (!terms) errs.terms = 'You must agree to the terms.'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    try {
      setLoading(true)
      const res = await fetch(CONFIG.API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, email, password, role })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || `Server error ${res.status}`)

      setSuccess('Registration successful! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setErrors({ general: err.message || 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-grid"></div>
      <div className="auth-orb orb-a"></div>
      <div className="auth-orb orb-b"></div>
      <div className="auth-orb orb-c"></div>

      <Navbar />

      <div className="auth-container">
        <div className="auth-card" style={{ animation: 'fadeInScale 0.6s ease-out' }}>
          {/* Branding */}
          <div className="auth-branding">
            <div className="auth-branding-content">
              <div className="auth-live-badge">
                <div className="live-dot"></div> Live Monitoring Active
              </div>
              <div className="auth-brand-logo">🌱</div>
              <h2 className="auth-brand-title">Join the Clean Air Movement</h2>
              <p className="auth-brand-subtitle">Take control of your health with comprehensive air quality monitoring and insights.</p>
              <ul className="auth-features">
                <li>Access to 52+ Indian cities &amp; states</li>
                <li>Personalized air quality dashboard</li>
                <li>Smart AI predictions &amp; forecasts</li>
                <li>Historical trend analysis tools</li>
                <li>Report pollution issues instantly</li>
              </ul>
              <div className="auth-stat-row">
                <div className="auth-stat"><div className="auth-stat-val">52+</div><div className="auth-stat-lbl">Cities</div></div>
                <div className="auth-stat"><div className="auth-stat-val">24/7</div><div className="auth-stat-lbl">Monitoring</div></div>
                <div className="auth-stat"><div className="auth-stat-val">AI</div><div className="auth-stat-lbl">Forecasts</div></div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="auth-form-section">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join AirSense for live AQI and clean-air guidance.</p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label><i className="fa fa-user" style={{ marginRight: '0.4rem', opacity: 0.6 }}></i>Full Name</label>
                <div className="input-icon-wrap">
                  <i className="fa fa-user field-icon"></i>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" required />
                </div>
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label><i className="fa fa-envelope" style={{ marginRight: '0.4rem', opacity: 0.6 }}></i>Email</label>
                <div className="input-icon-wrap">
                  <i className="fa fa-at field-icon"></i>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label><i className="fa fa-lock" style={{ marginRight: '0.4rem', opacity: 0.6 }}></i>Password</label>
                <div className="input-icon-wrap">
                  <i className="fa fa-lock field-icon"></i>
                  <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required />
                  <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)} tabIndex="-1"><i className={`fa ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label><i className="fa fa-lock" style={{ marginRight: '0.4rem', opacity: 0.6 }}></i>Confirm Password</label>
                <div className="input-icon-wrap">
                  <i className="fa fa-lock field-icon"></i>
                  <input type={showConfirmPwd ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your password" required />
                  <button type="button" className="pwd-toggle" onClick={() => setShowConfirmPwd(!showConfirmPwd)} tabIndex="-1"><i className={`fa ${showConfirmPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
                </div>
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
              <div className="form-group">
                <label><i className="fa fa-id-badge" style={{ marginRight: '0.4rem', opacity: 0.6 }}></i>Role</label>
                <div className="input-icon-wrap">
                  <select value={role} onChange={e => setRole(e.target.value)} required style={{ paddingLeft: '1rem' }}>
                    <option value="">-- Select Role --</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {errors.role && <span className="error-message">{errors.role}</span>}
              </div>
              <div className="form-group">
                <div className="checkbox-group">
                  <input type="checkbox" id="regTerms" checked={terms} onChange={e => setTerms(e.target.checked)} />
                  <label htmlFor="regTerms">I agree to Terms and Conditions</label>
                </div>
                {errors.terms && <span className="error-message">{errors.terms}</span>}
              </div>
              {success && <div className="success-message">{success}</div>}
              {errors.general && <div className="error-message">{errors.general}</div>}
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                <i className="fa fa-user-plus" style={{ marginRight: '0.5rem' }}></i>{loading ? 'Registering...' : 'Create Account'}
              </button>
            </form>
            <p className="auth-link">Already have an account? <Link to="/login">Log in</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
