import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { Producto } from "@/types";

const Index = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el Modal
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Cargar Productos Reales
  useEffect(() => {
    fetch("http://localhost:3000/api/productos")
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setProductos(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Filtrar Ofertas para el Carrusel
  const productosOferta = productos.filter(p => p.oferta);

  // Manejar clic en producto
  const handleProductClick = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      {/* Carrusel Inteligente: Solo muestra ofertas si las hay */}
      {productosOferta.length > 0 ? (
          <HeroCarousel products={productosOferta} />
      ) : (
          /* Banner por defecto si no hay ofertas */
          <div className="w-full h-64 bg-pink-200 flex items-center justify-center">
              <h1 className="text-4xl text-white font-bold drop-shadow-md">¡Bienvenido a Mielissimo! 🍬</h1>
          </div>
      )}

      {/* Aquí iría el CategoryScroll (Próximo paso) */}
      
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-mielissimo-pink pl-3">
          Todos los Productos
        </h2>

        {loading ? (
          <p className="text-center py-10">Cargando dulzura...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {productos.map((prod) => (
              <ProductCard 
                key={prod.id} 
                product={prod} 
                onClick={handleProductClick} 
              />
            ))}
          </div>
        )}
      </main>

      <CartDrawer />
      
      {/* El Modal que creamos */}
      <ProductModal 
        producto={productoSeleccionado}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default Index;