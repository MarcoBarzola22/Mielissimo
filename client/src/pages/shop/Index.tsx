import { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { HeroCarousel } from '@/components/HeroCarousel';
import { CategoryScroll } from '@/components/CategoryScroll';
import { ProductGrid } from '@/components/ProductGrid';
import { products } from '@/data/products';

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={setSearchQuery} />
      <CartDrawer />
      
      <main>
        <HeroCarousel />
        
        <div className="py-4">
          <h2 className="text-lg font-semibold text-foreground px-4 mb-2">
            Categorías
          </h2>
          <CategoryScroll
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <div>
          <div className="flex items-center justify-between px-4 mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {selectedCategory === 'all' ? 'Todos los productos' : 'Productos'}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredProducts.length} productos
            </span>
          </div>
          <ProductGrid products={filteredProducts} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4 mt-8">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">🍯</span>
            <span className="text-xl font-bold text-primary">Mielissimo</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Las mejores golosinas con el sabor más dulce
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            © 2024 Mielissimo. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
