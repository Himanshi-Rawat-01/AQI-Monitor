import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <div className="footer-wrap">
      <footer className="footer" id="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h4>About AQI Monitor</h4>
            <p>Track air quality, get forecasts, and protect your health. Powered by MongoDB and OpenWeather API.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: support@aqimonitor.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} AQI Monitor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
