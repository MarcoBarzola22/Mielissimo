import React, { useEffect } from 'react';
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
    fetchConfig().then(config => {
      const status = config.estado_local || config.ESTADO_LOCAL;
      if (status) {
        setStoreStatus(String(status).toUpperCase());
      }
    }).catch(console.error);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      
      {/* --- AQUÍ ESTÁ LA SOLUCIÓN DEL CARTEL --- */}
      {/* Al ponerlo afuera del div relative, el fixed funciona perfecto */}
      <StoreStatusBanner />

      <div className="min-h-screen flex flex-col bg-gray-50 relative">
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