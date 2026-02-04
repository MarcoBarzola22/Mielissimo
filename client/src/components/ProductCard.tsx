import { Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';
import { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  // Logic to find base price from variants or product itself
  // Backend returns 'precio' on product but also variants
  const price = product.precio;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Adapt for CartContext if needed, or update CartContext to use new Product type
    // Assuming CartContext expects specific fields, let's map them
    const cartProduct = {
      ...product,
      id: product.id.toString(), // Cart likely expects string ID
      name: product.nombre,
      image: product.imagen ? `http://localhost:3000/uploads/${product.imagen}` : '/placeholder.svg',
      price: price
    };

    // For now simplistic add
    addToCart(cartProduct as any, {} as any);
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
        {product.oferta && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            OFERTA
          </div>
        )}
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
              ${Number(price).toLocaleString('es-AR')}
            </span>
            {product.precio_oferta && (
              <span className="text-xs text-muted-foreground ml-1 line-through">
                ${Number(product.precio_oferta).toLocaleString('es-AR')}
              </span>
            )}
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