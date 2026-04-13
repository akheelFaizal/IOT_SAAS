import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { DeviceProvider } from './store/DeviceContext'
import { AuthProvider } from './store/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <DeviceProvider>
        <BrowserRouter>
           <App />
        </BrowserRouter>
      </DeviceProvider>
    </AuthProvider>
  </StrictMode>,
)
