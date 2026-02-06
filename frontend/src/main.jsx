import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import CartSlideOver from './components/CartSlideOver'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Navbar />
    <CartSlideOver />
    <Home />
    <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
  </StrictMode>,
)
