import { useState, useCallback } from 'react'
import Navbar from '../components/Navbar'
import AuthBackground from '../components/AuthBackground'
import CONFIG from '../config'

function BrandingContent() {
  return (
    <div className="branding-inner">
      <div className="auth-live-badge"><div className="live-dot" /> Live Monitoring Active</div>
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
      <div className="branding-deco deco-1">🌿</div>
      <div className="branding-deco deco-2">💨</div>
      <div className="branding-deco deco-3">📊</div>
    </div>
  )
}

export default function Login() {
  const [activeTab,   setActiveTab]   = useState('login')
  const [isSwitching, setIsSwitching] = useState(false)
  const [switchDir,   setSwitchDir]   = useState('right')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [showLoginPwd, setShowLoginPwd] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

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
    if (tab === activeTab || isSwitching) return
    setSwitchDir(tab === 'signup' ? 'right' : 'left')
    setIsSwitching(true)
    setTimeout(() => setIsSwitching(false), 700)
    setActiveTab(tab)
    setLoginError('')
    setRegErrors({})
    setRegSuccess('')
  }, [activeTab, isSwitching])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    if (!loginEmail)    { setLoginError('Email is required.');    return }
    if (!loginPassword) { setLoginError('Password is required.'); return }
    try {
      setLoginLoading(true)
      const res = await fetch(CONFIG.API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      let data
      try { const t = await res.text(); data = t ? JSON.parse(t) : {} }
      catch { throw new Error(`Server error (HTTP ${res.status}). Is the backend running?`) }
      if (!res.ok) throw new Error(data.error || data.message || `Server error ${res.status}`)
      if (data.access_token) {
        const store = rememberMe ? localStorage : sessionStorage
        store.setItem('aqi_token', data.access_token)
        store.setItem('aqi_user', JSON.stringify({ email: data.email, username: data.username }))
        window.location.replace('/frontend/dashboard.html')
      } else { setLoginError(data.error || 'Login failed.') }
    } catch (err) { setLoginError(err.message || 'Network error.') }
    finally { setLoginLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!regName)                               errors.name = 'Name is required.'
    if (!regEmail)                              errors.email = 'Email is required.'
    if (!regPassword || regPassword.length < 6) errors.password = 'Min 6 characters.'
    if (regPassword !== regConfirmPassword)     errors.confirmPassword = 'Passwords do not match.'
    if (!regRole)                               errors.role = 'Please select a role.'
    if (!regTerms)                              errors.terms = 'You must agree to the terms.'
    setRegErrors(errors)
    if (Object.keys(errors).length > 0) return
    try {
      setRegLoading(true)
      const res = await fetch(CONFIG.API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regName, email: regEmail, password: regPassword, role: regRole }),
      })
      let data
      try { const t = await res.text(); data = t ? JSON.parse(t) : {} }
      catch { throw new Error(`Server error (HTTP ${res.status}). Is the backend running?`) }
      if (!res.ok) throw new Error(data.error || data.message || `Server error ${res.status}`)
      setRegSuccess('Account created! Switching to login…')
      setTimeout(() => switchTab('login'), 1500)
    } catch (err) { setRegErrors({ general: err.message || 'Network error.' }) }
    finally { setRegLoading(false) }
  }

  const isSignup = activeTab === 'signup'

  return (
    <div className="auth-page">
      <AuthBackground />
      <div className="auth-glass-overlay" />
      <Navbar />
      <div className="auth-container">
        <div className={`auth-split-card${isSignup ? ' signup-mode' : ''}`}>

          {/* ── TOGGLE — centered, z-index above overlay ── */}
          <div className="auth-toggle-strip">
            <div className="auth-toggle-pill">
              <div className={['toggle-indicator', isSignup ? 'right' : 'left', isSwitching ? 'switching' : ''].filter(Boolean).join(' ')} />
              <button className={`toggle-btn${!isSignup ? ' active' : ''}`} onClick={() => switchTab('login')} id="auth-login-tab">
                <i className="fa fa-sign-in-alt" /><span>Log In</span>
              </button>
              <button className={`toggle-btn${isSignup ? ' active' : ''}`} onClick={() => switchTab('signup')} id="auth-signup-tab">
                <i className="fa fa-user-plus" /><span>Sign Up</span>
              </button>
            </div>
          </div>

          {/* ── LOGIN FORM — fixed left half ── */}
          <div className="auth-form-half login-half">
            <div className="panel-inner">
              <div className="auth-panel-header">
                <div className="panel-icon-ring"><i className="fa fa-leaf" /></div>
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Log in to track local air quality &amp; alerts.</p>
              </div>
              <form className="auth-form" onSubmit={handleLogin}>
                <div className="form-group">
                  <label><i className="fa fa-envelope" /> Email</label>
                  <div className="input-icon-wrap">
                    <i className="fa fa-at field-icon" />
                    <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Enter your email" required />
                  </div>
                </div>
                <div className="form-group">
                  <label><i className="fa fa-lock" /> Password</label>
                  <div className="input-icon-wrap">
                    <i className="fa fa-lock field-icon" />
                    <input type={showLoginPwd ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Enter your password" required />
                    <button type="button" className="pwd-toggle" onClick={() => setShowLoginPwd(v => !v)} tabIndex="-1">
                      <i className={`fa ${showLoginPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <div className="checkbox-group">
                    <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                    <label htmlFor="rememberMe">Remember me</label>
                  </div>
                </div>
                {loginError && <div className="error-message"><i className="fa fa-exclamation-circle" /> {loginError}</div>}
                <button type="submit" className="btn btn-primary btn-block" disabled={loginLoading} id="login-submit-btn">
                  {loginLoading ? <><i className="fa fa-spinner fa-spin" /> Logging in...</> : <><i className="fa fa-sign-in-alt" /> Log In</>}
                </button>
              </form>
              <p className="auth-link">Don't have an account? <a href="#" onClick={e => { e.preventDefault(); switchTab('signup') }}>Sign up free</a></p>
            </div>
          </div>

          {/* ── SIGNUP FORM — fixed right half ── */}
          <div className="auth-form-half signup-half">
            <div className="panel-inner">
              <div className="auth-panel-header">
                <div className="panel-icon-ring signup-icon"><i className="fa fa-user-plus" /></div>
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Join AirSense for live AQI &amp; clean-air guidance.</p>
              </div>
              <form className="auth-form" onSubmit={handleRegister}>
                <div className="form-group">
                  <label><i className="fa fa-user" /> Full Name</label>
                  <div className="input-icon-wrap">
                    <i className="fa fa-user field-icon" />
                    <input type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Enter your full name" required />
                  </div>
                  {regErrors.name && <span className="error-message">{regErrors.name}</span>}
                </div>
                <div className="form-group">
                  <label><i className="fa fa-envelope" /> Email</label>
                  <div className="input-icon-wrap">
                    <i className="fa fa-at field-icon" />
                    <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="Enter your email" required />
                  </div>
                  {regErrors.email && <span className="error-message">{regErrors.email}</span>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label><i className="fa fa-lock" /> Password</label>
                    <div className="input-icon-wrap">
                      <i className="fa fa-lock field-icon" />
                      <input type={showRegPwd ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Min 6 chars" required />
                      <button type="button" className="pwd-toggle" onClick={() => setShowRegPwd(v => !v)} tabIndex="-1"><i className={`fa ${showRegPwd ? 'fa-eye-slash' : 'fa-eye'}`} /></button>
                    </div>
                    {regErrors.password && <span className="error-message">{regErrors.password}</span>}
                  </div>
                  <div className="form-group">
                    <label><i className="fa fa-lock" /> Confirm</label>
                    <div className="input-icon-wrap">
                      <i className="fa fa-lock field-icon" />
                      <input type={showRegConfirmPwd ? 'text' : 'password'} value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} placeholder="Repeat password" required />
                      <button type="button" className="pwd-toggle" onClick={() => setShowRegConfirmPwd(v => !v)} tabIndex="-1"><i className={`fa ${showRegConfirmPwd ? 'fa-eye-slash' : 'fa-eye'}`} /></button>
                    </div>
                    {regErrors.confirmPassword && <span className="error-message">{regErrors.confirmPassword}</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label><i className="fa fa-id-badge" /> Role</label>
                  <div className="input-icon-wrap">
                    <i className="fa fa-id-badge field-icon" />
                    <select value={regRole} onChange={e => setRegRole(e.target.value)} required>
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
                    <label htmlFor="terms">I agree to Terms &amp; Conditions</label>
                  </div>
                  {regErrors.terms && <span className="error-message">{regErrors.terms}</span>}
                </div>
                {regSuccess     && <div className="success-message"><i className="fa fa-check-circle" /> {regSuccess}</div>}
                {regErrors.general && <div className="error-message"><i className="fa fa-exclamation-circle" /> {regErrors.general}</div>}
                <button type="submit" className="btn btn-primary btn-block signup-btn" disabled={regLoading} id="signup-submit-btn">
                  {regLoading ? <><i className="fa fa-spinner fa-spin" /> Creating account...</> : <><i className="fa fa-user-plus" /> Create Account</>}
                </button>
              </form>
              <p className="auth-link">Already have an account? <a href="#" onClick={e => { e.preventDefault(); switchTab('login') }}>Log in</a></p>
            </div>
          </div>

          {/* ── BRANDING OVERLAY — sweeps left↔right across the card ── */}
          <div className="auth-overlay-panel">
            <BrandingContent />
          </div>

        </div>
      </div>
    </div>
  )
}
