import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CONFIG from '../config'

export default function Login() {
  // Auto-redirect if already logged in (token in localStorage or sessionStorage)
  const [activeTab, setActiveTab] = useState('login')

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [showLoginPwd, setShowLoginPwd] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Signup state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regRole, setRegRole] = useState('')
  const [regTerms, setRegTerms] = useState(false)
  const [showRegPwd, setShowRegPwd] = useState(false)
  const [showRegConfirmPwd, setShowRegConfirmPwd] = useState(false)
  const [regErrors, setRegErrors] = useState({})
  const [regSuccess, setRegSuccess] = useState('')
  const [regLoading, setRegLoading] = useState(false)

  const switchTab = useCallback((tab) => {
    setActiveTab(tab)
    setLoginError('')
    setRegErrors({})
    setRegSuccess('')
  }, [])

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    if (!loginEmail) { setLoginError('Email is required.'); return }
    if (!loginPassword) { setLoginError('Password is required.'); return }

    try {
      setLoginLoading(true)
      const res = await fetch(CONFIG.API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      })

      // Safely parse JSON — guards against empty responses when backend is down
      let data
      try {
        const text = await res.text()
        data = text ? JSON.parse(text) : {}
      } catch {
        throw new Error(`Server returned invalid response (HTTP ${res.status}). Is the backend running?`)
      }

      if (!res.ok) throw new Error(data.error || data.message || `Server error ${res.status}`)

      if (data.access_token) {
        const store = rememberMe ? localStorage : sessionStorage
        store.setItem('aqi_token', data.access_token)
        store.setItem('aqi_user', JSON.stringify({ email: data.email, username: data.username }))
        window.location.replace('/frontend/dashboard.html')
      } else {
        setLoginError(data.error || 'Login failed.')
      }
    } catch (err) {
      setLoginError(err.message || 'Network error. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!regName) errors.name = 'Name is required.'
    if (!regEmail) errors.email = 'Email is required.'
    if (!regPassword || regPassword.length < 6) errors.password = 'Password must be at least 6 chars.'
    if (regPassword !== regConfirmPassword) errors.confirmPassword = 'Passwords do not match.'
    if (!regRole) errors.role = 'Please select a role.'
    if (!regTerms) errors.terms = 'You must agree to the terms.'
    setRegErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      setRegLoading(true)
      const res = await fetch(CONFIG.API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regName, email: regEmail, password: regPassword, role: regRole })
      })

      let data
      try {
        const text = await res.text()
        data = text ? JSON.parse(text) : {}
      } catch {
        throw new Error(`Server returned invalid response (HTTP ${res.status}). Is the backend running?`)
      }

      if (!res.ok) throw new Error(data.error || data.message || `Server error ${res.status}`)

      setRegSuccess('Account created! Switching to login…')
      setTimeout(() => switchTab('login'), 1500)
    } catch (err) {
      setRegErrors({ general: err.message || 'Network error.' })
    } finally {
      setRegLoading(false)
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
              <div className="auth-brand-logo">🌍</div>
              <h2 className="auth-brand-title">Track Air Quality in Real-Time</h2>
              <p className="auth-brand-subtitle">Monitor pollution levels, get health advisories, and stay informed about the air you breathe.</p>
              <ul className="auth-features">
                <li>Live AQI data from 52+ Indian locations</li>
                <li>AI-powered air quality predictions</li>
                <li>Personalized health recommendations</li>
                <li>7-day pollution trend analysis</li>
                <li>Real-time alerts and notifications</li>
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
            <div className="auth-tabs">
              <button className={`auth-tab${activeTab === 'login' ? ' active' : ''}`} onClick={() => switchTab('login')}>Log In</button>
              <button className={`auth-tab${activeTab === 'signup' ? ' active' : ''}`} onClick={() => switchTab('signup')}>Sign Up</button>
            </div>

            <div className={`auth-slider${activeTab === 'signup' ? ' signup-active' : ''}`}>
              <div className="auth-panels">
                {/* Login Panel */}
                <div className="auth-panel">
                  <h1 className="auth-title">Welcome Back</h1>
                  <p className="auth-subtitle">Log in to track local air quality and alerts.</p>
                  <form className="auth-form" onSubmit={handleLogin}>
                    <div className="form-group">
                      <label><i className="fa fa-envelope" style={{ marginRight: '0.4rem', opacity: 0.6 }}></i>Email</label>
                      <div className="input-icon-wrap">
                        <i className="fa fa-at field-icon"></i>
                        <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Enter your email" required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label><i className="fa fa-lock" style={{ marginRight: '0.4rem', opacity: 0.6 }}></i>Password</label>
                      <div className="input-icon-wrap">
                        <i className="fa fa-lock field-icon"></i>
                        <input type={showLoginPwd ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Enter your password" required />
                        <button type="button" className="pwd-toggle" onClick={() => setShowLoginPwd(!showLoginPwd)} tabIndex="-1">
                          <i className={`fa ${showLoginPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="checkbox-group">
                        <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                        <label htmlFor="rememberMe">Remember me</label>
                      </div>
                    </div>
                    {loginError && <div className="error-message">{loginError}</div>}
                    <button type="submit" className="btn btn-primary btn-block" disabled={loginLoading}>
                      <i className="fa fa-sign-in-alt" style={{ marginRight: '0.5rem' }}></i>{loginLoading ? 'Logging in...' : 'Log In'}
                    </button>
                  </form>
                  <p className="auth-link">Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); switchTab('signup') }}>Sign up</a></p>
                </div>

                {/* Signup Panel */}
                <div className="auth-panel">
                  <h1 className="auth-title">Create Account</h1>
                  <p className="auth-subtitle">Join AirSense for live AQI and clean-air guidance.</p>
                  <form className="auth-form" onSubmit={handleRegister}>
                    <div className="form-group">
                      <label><i className="fa fa-user" style={{ marginRight: '0.4rem', opacity: 0.6 }}></i>Full Name</label>
                      <div className="input-icon-wrap">
                        <i className="fa fa-user field-icon"></i>
                        <input type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Enter your full name" required />
                      </div>
                      {regErrors.name && <span className="error-message">{regErrors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label><i className="fa fa-envelope" style={{ marginRight: '0.4rem', opacity: 0.6 }}></i>Email</label>
                      <div className="input-icon-wrap">
                        <i className="fa fa-at field-icon"></i>
                        <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="Enter your email" required />
                      </div>
                      {regErrors.email && <span className="error-message">{regErrors.email}</span>}
                    </div>
                    <div className="form-group">
                      <label><i className="fa fa-lock" style={{ marginRight: '0.4rem', opacity: 0.6 }}></i>Password</label>
                      <div className="input-icon-wrap">
                        <i className="fa fa-lock field-icon"></i>
                        <input type={showRegPwd ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Min 6 characters" required />
                        <button type="button" className="pwd-toggle" onClick={() => setShowRegPwd(!showRegPwd)} tabIndex="-1"><i className={`fa ${showRegPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
                      </div>
                      {regErrors.password && <span className="error-message">{regErrors.password}</span>}
                    </div>
                    <div className="form-group">
                      <label><i className="fa fa-lock" style={{ marginRight: '0.4rem', opacity: 0.6 }}></i>Confirm Password</label>
                      <div className="input-icon-wrap">
                        <i className="fa fa-lock field-icon"></i>
                        <input type={showRegConfirmPwd ? 'text' : 'password'} value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} placeholder="Repeat your password" required />
                        <button type="button" className="pwd-toggle" onClick={() => setShowRegConfirmPwd(!showRegConfirmPwd)} tabIndex="-1"><i className={`fa ${showRegConfirmPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
                      </div>
                      {regErrors.confirmPassword && <span className="error-message">{regErrors.confirmPassword}</span>}
                    </div>
                    <div className="form-group">
                      <label><i className="fa fa-id-badge" style={{ marginRight: '0.4rem', opacity: 0.6 }}></i>Role</label>
                      <div className="input-icon-wrap">
                        <select value={regRole} onChange={e => setRegRole(e.target.value)} required style={{ paddingLeft: '1rem' }}>
                          <option value="">-- Select Role --</option>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      {regErrors.role && <span className="error-message">{regErrors.role}</span>}
                    </div>
                    <div className="form-group">
                      <div className="checkbox-group">
                        <input type="checkbox" id="terms" checked={regTerms} onChange={e => setRegTerms(e.target.checked)} />
                        <label htmlFor="terms">I agree to Terms and Conditions</label>
                      </div>
                      {regErrors.terms && <span className="error-message">{regErrors.terms}</span>}
                    </div>
                    {regSuccess && <div className="success-message">{regSuccess}</div>}
                    {regErrors.general && <div className="error-message">{regErrors.general}</div>}
                    <button type="submit" className="btn btn-primary btn-block" disabled={regLoading}>
                      <i className="fa fa-user-plus" style={{ marginRight: '0.5rem' }}></i>{regLoading ? 'Creating account...' : 'Create Account'}
                    </button>
                  </form>
                  <p className="auth-link">Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); switchTab('login') }}>Log in</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
