import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 🟢 ১. BrowserRouter ইমপোর্ট করা হলো
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* 🟢 ২. App-কে BrowserRouter দিয়ে র‍্যাপ করা হলো */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)