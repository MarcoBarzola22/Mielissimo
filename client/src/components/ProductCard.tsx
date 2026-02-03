import { Plus } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const defaultVariant = product.variants[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, defaultVariant);
  };

  return (
    <Link
      to={`/producto/${product.id}`}
      className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.featured && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
            ⭐ Popular
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-sm mb-1 truncate group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary">
              ${defaultVariant.price.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              / {defaultVariant.name}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-soft active:scale-95"
            aria-label="Agregar al carrito"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  );
}
