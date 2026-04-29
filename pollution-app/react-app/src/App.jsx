import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Plasma from './components/Plasma'
import CONFIG from './config'

function App() {
  const [plasmaColor, setPlasmaColor] = useState('#ffffff')
  const location = useLocation()

  return (
    <>
      {location.pathname === '/' && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none', backgroundColor: '#000000' }}>
          <Plasma
            color={plasmaColor}
            speed={0.6}
            direction="forward"
            scale={1.1}
            opacity={0.4}
            mouseInteractive={true}
          />
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home setPlasmaColor={setPlasmaColor} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}



export default App
