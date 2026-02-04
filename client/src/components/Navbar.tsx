import { ShoppingBag, Search, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '@/context/CartContext';
import { CartDrawer } from './CartDrawer';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export function Navbar({ onSearch }: NavbarProps) {
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              Mielissimo
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="w-5 h-5 text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-mielissimo-pink text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce-soft">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </nav>
      <CartDrawer />
    </>
  );
}
