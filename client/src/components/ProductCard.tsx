import { Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';

interface Variant {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
}

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  categoria_id: number;
  variantes?: Variant[];
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  
  // Obtenemos la primera variante para mostrar el precio inicial
  // Si tu backend devuelve las variantes, las usamos, sino ponemos valores por defecto
  const defaultVariant = product.variantes && product.variantes.length > 0 
    ? product.variantes[0] 
    : { nombre: "Unidad", precio: 0, id: 0 };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Adaptamos el objeto para el CartContext
    const cartProduct = {
      ...product,
      name: product.nombre, // Mapeo de nombre
      image: `http://localhost:3000/uploads/${product.imagen}` // Ruta real al servidor
    };
    
    const cartVariant = {
      ...defaultVariant,
      name: defaultVariant.nombre,
      price: defaultVariant.precio
    };

    addToCart(cartProduct as any, cartVariant as any);
  };

  return (
    <Link
      to={`/producto/${product.id}`}
      className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-border"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.imagen ? `http://localhost:3000/uploads/${product.imagen}` : '/placeholder.svg'}
          alt={product.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-sm mb-1 truncate group-hover:text-primary transition-colors">
          {product.nombre}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {product.descripcion}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary">
              ${Number(defaultVariant.precio).toLocaleString('es-AR')}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              / {defaultVariant.nombre}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-sm active:scale-95"
            aria-label="Agregar al carrito"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  );
}