import { Product } from '@/data/products';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <span className="text-6xl mb-4">🔍</span>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No encontramos productos
        </h3>
        <p className="text-muted-foreground text-sm">
          Intenta con otra categoría o búsqueda
        </p>
      </div>
    );
  }

  return (
    <section className="px-4 pb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
