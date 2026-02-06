import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSlideOver from './components/CartSlideOver';
import StoreStatusBanner from './components/StoreStatusBanner';
import Home from './pages/Home';
import { useStore } from './context/store';
import { fetchConfig } from './services/api';

function App() {
  const { setStoreStatus } = useStore();

  useEffect(() => {
    // Load store configuration on mount
    fetchConfig().then(config => {
      if (config.ESTADO_LOCAL) {
        setStoreStatus(config.ESTADO_LOCAL);
      }
    }).catch(console.error);
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <StoreStatusBanner />
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
