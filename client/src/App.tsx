import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Páginas de la Tienda (Lovable)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Páginas del Admin (Tuyas migradas)
import LoginAdmin from "./pages/admin/LoginAdmin";
// import Dashboard from "./pages/admin/Dashboard"; // <-- Lo crearemos en el siguiente paso

const queryClient = new QueryClient();

// Componente simple para proteger rutas (Si no hay token, manda al login)
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
          
          {/* <Route 
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