import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroCarousel } from "@/components/HeroCarousel";
import { CategoryScroll } from "@/components/CategoryScroll";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/hooks/useShopData";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: products = [], isLoading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showOffers, setShowOffers] = useState(false);

  // Filter products based on selection
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (showOffers) {
      filtered = filtered.filter(p => p.oferta);
    } else if (selectedCategory) {
      filtered = filtered.filter(p => {
        if (p.categorias_ids && Array.isArray(p.categorias_ids)) {
          return p.categorias_ids.includes(parseInt(selectedCategory));
        }
        return false;
      });
    }

    return filtered;
  }, [products, selectedCategory, showOffers]);

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setShowOffers(false); // Reset offers when picking a category
  };

  const handleToggleOffers = (show: boolean) => {
    setShowOffers(show);
    if (show) setSelectedCategory(null); // Reset category when clicking offers
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Navbar />
        <main>
          <div className="container mx-auto px-4 mt-8">
            <Skeleton className="h-48 w-full rounded-2xl mb-8" />
          </div>
          <div className="w-full h-16 bg-white/80 mb-8" />
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main>
        <HeroCarousel />
        <CategoryScroll
          onSelectCategory={handleCategorySelect}
          onToggleOffers={handleToggleOffers}
          selectedCategory={selectedCategory}
          showOffers={showOffers}
        />
        <div className="container mx-auto px-4 py-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No se encontraron productos en esta sección.
            </div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;