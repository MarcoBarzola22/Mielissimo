import { ShoppingCart, User, Search, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Navbar = () => {
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* IZQUIERDA: Menú Mobile y Logo */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden text-gray-600">
            <Menu className="h-6 w-6" />
          </Button>
          
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
                <div className="absolute -inset-1 bg-pink-200 rounded-full opacity-0 group-hover:opacity-50 blur transition duration-200"></div>
                <img 
                    src="/assets/logoCanva.png" 
                    alt="Mielissimo" 
                    className="h-12 w-auto relative transform transition duration-200 group-hover:scale-110" 
                    onError={(e) => e.currentTarget.style.display = 'none'} 
                />
            </div>
            <span className="text-2xl font-bold text-mielissimo-pink tracking-tight hidden sm:block font-serif">
              Mielissimo
            </span>
          </Link>
        </div>

        {/* CENTRO: Buscador (Estilo Lovable) */}
        <div className="hidden md:flex items-center relative max-w-md w-full mx-8">
          <Input 
            type="text" 
            placeholder="¿Qué antojo tienes hoy?" 
            className="w-full pl-10 pr-4 py-2 rounded-full border-pink-200 focus:border-mielissimo-pink focus:ring-pink-200 bg-pink-50/50"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-400" />
        </div>

        {/* DERECHA: Acciones */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-mielissimo-pink hover:bg-pink-50 rounded-full transition-colors">
              <User className="h-6 w-6" />
            </Button>
          </Link>

          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-gray-600 hover:text-mielissimo-pink hover:bg-pink-50 rounded-full transition-colors p-2"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-mielissimo-pink text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
};