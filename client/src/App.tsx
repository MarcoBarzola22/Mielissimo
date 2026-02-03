import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// --- CORRECCIÓN AQUÍ: Agregamos "/shop" a la ruta ---
import Index from "./pages/shop/Index";
import NotFound from "./pages/shop/NotFound";
// ----------------------------------------------------

// Página del Admin (Tuya)
import LoginAdmin from "./pages/admin/LoginAdmin";
// import Dashboard from "./pages/admin/Dashboard"; 

const queryClient = new QueryClient();

// Componente para proteger rutas (Por ahora no se usa, por eso sale en gris)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RutaProtegida = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("tokenAdmin");
  if (!token) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* --- RUTAS PÚBLICAS (TIENDA) --- */}
          <Route path="/" element={<Index />} />
          
          {/* --- RUTAS ADMIN --- */}
          <Route path="/admin" element={<LoginAdmin />} />
          <Route path="/admin/login" element={<LoginAdmin />} />
          
          {/* Dashboard (Comentado hasta que lo creemos)
          <Route 
            path="/admin/dashboard" 
            element={
              <RutaProtegida>
                <Dashboard /> 
              </RutaProtegida>
            } 
          /> */}

          {/* Error 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;