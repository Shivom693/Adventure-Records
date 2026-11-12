import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global safeguard for product/release flagging checks (ensures "isSendFlaggedProduct is not defined" never throws)
if (typeof window !== 'undefined') {
  window.isSendFlaggedProduct = window.isSendFlaggedProduct || function(prod) { return false; };
  window.isEmailFlaggedFraud = window.isEmailFlaggedFraud || function(email) {
    return (email || '').toLowerCase().trim() === 'bhoomiadventure7@gmail.com';
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
