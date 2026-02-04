import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext"; // <--- 1. AGREGAR ESTO

import Index from "./pages/shop/Index";
import NotFound from "./pages/shop/NotFound";
import LoginAdmin from "./pages/admin/LoginAdmin";
import Dashboard from "./pages/admin/Dashboard";

const queryClient = new QueryClient();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RutaProtegida = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("tokenAdmin");
  if (!token) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Rutas Admin */}
            <Route path="/admin" element={<LoginAdmin />} />
            <Route path="/admin/login" element={<LoginAdmin />} />

            <Route
              path="/admin/dashboard"
              element={
                <RutaProtegida>
                  <Dashboard />
                </RutaProtegida>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;