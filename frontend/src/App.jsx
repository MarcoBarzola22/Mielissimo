import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
// Footer quitado de aquí (está en Home)
import CartSlideOver from './components/CartSlideOver';
import StoreStatusBanner from './components/StoreStatusBanner';
import Home from './pages/Home';
import { useStore } from './context/store';
import { fetchConfig } from './services/api';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const { setStoreStatus } = useStore();

  useEffect(() => {
    fetchConfig().then(config => {
      const status = config.estado_local || config.ESTADO_LOCAL;
      if (status) setStoreStatus(String(status).toUpperCase());
    }).catch(console.error);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-50 relative">
        {/* Banner Global (Fixed Z-Index High) */}
        <StoreStatusBanner />
        
        {/* Navbar Global */}
        <Navbar />
        
        <CartSlideOver />

        {/* El padding-top se maneja en Home para acomodar el banner */}
        <Routes>
            <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;