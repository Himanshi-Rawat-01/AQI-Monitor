import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import SmoothScroll from './components/SmoothScroll.jsx'
import './styles/global.css'
import './styles/animations.css'
import './styles/navbar.css'
import './styles/hero.css'
import './styles/features.css'
import './styles/process.css'
import './styles/control.css'
import './styles/footer.css'
import './styles/auth.css'
import './styles/responsive.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SmoothScroll>
        <App />
      </SmoothScroll>
    </BrowserRouter>
  </React.StrictMode>,
)
