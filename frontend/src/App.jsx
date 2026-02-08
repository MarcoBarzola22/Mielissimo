import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSlideOver from './components/CartSlideOver';
import StoreStatusBanner from './components/StoreStatusBanner';
import Home from './pages/Home';
import { useStore } from './context/store';
import { fetchConfig } from './services/api';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const { setStoreStatus } = useStore();

  useEffect(() => {
    // Load store configuration on mount
    fetchConfig().then(config => {
      // Robust check: config keys might be lowercase from DB
      // We look for 'estado_local' (DB column) or 'ESTADO_LOCAL' (Legacy)
      const status = config.estado_local || config.ESTADO_LOCAL;
      if (status) {
        setStoreStatus(String(status).toUpperCase());
      }
    }).catch(console.error);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      {/* Wrapper relative to ensure Z-Index stacking works */}
      <div className="min-h-screen flex flex-col bg-gray-50 relative">

        {/* Banner with high Z-Index */}
        <div className="sticky top-0 z-[9999] w-full">
          <StoreStatusBanner />
        </div>

        <Navbar />
        <CartSlideOver />

        <div className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
