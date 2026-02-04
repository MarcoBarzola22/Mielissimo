import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroCarousel } from "@/components/HeroCarousel";
import { CategoryScroll } from "@/components/CategoryScroll";
import { ProductGrid } from "@/components/ProductGrid";
import axios from "axios";

const Index = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/productos");
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleCategorySelect = (categoryId: string | null) => {
    if (!categoryId) {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((p: any) => p.categoria_id === parseInt(categoryId)));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroCarousel />
        <CategoryScroll onSelectCategory={handleCategorySelect} />
        <div className="container mx-auto px-4 py-8">
          <ProductGrid products={filteredProducts} />
        </div>
      </main>
    </div>
  );
};

export default Index;