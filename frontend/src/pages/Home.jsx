import React, { useEffect, useState } from 'react';
import { fetchProducts, fetchCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoryPills from '../components/CategoryPills';
import ProductModal from '../components/ProductModal';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { useStore } from '../context/store';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [activeCategory, setActiveCategory] = useState({ id: 'todas', nombre: 'Ver Todo' });
    const { searchQuery } = useStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([fetchProducts(), fetchCategories()])
            .then(([productsData, categoriesData]) => {
                setProducts(productsData);
                // ACÁ ESTÁ: Agregamos "Ofertas 🔥" manualmente
                setCategories([
                    { id: 'todas', nombre: 'Ver Todo' }, 
                    { id: 'ofertas', nombre: 'Ofertas 🔥' }, 
                    ...categoriesData
                ]);
                setLoading(false);
            })
            .catch(err => { console.error(err); setLoading(false); });
    }, []);

    const filteredProducts = products.filter(p => {
        // 1. Filtro por Buscador
        if (searchQuery && !p.nombre.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        
        // 2. Filtro por Categoría
        if (activeCategory.id === 'todas') return true;
        
        // LOGICA DE OFERTAS RESTAURADA
        if (activeCategory.id === 'ofertas') {
            return p.es_oferta === 1 || p.es_oferta === true;
        }

        return (p.categorias && p.categorias.some(c => c.id === activeCategory.id)) || p.categoria_id === activeCategory.id;
    });

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <div className="flex-grow pt-32 px-4 pb-10">
                <CategoryPills
                    categories={categories}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                />

                <div className="max-w-7xl mx-auto mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 border-l-4 border-[#ef5579] pl-3">
                            {activeCategory.nombre}
                        </h3>
                        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                            {filteredProducts.length} productos
                        </span>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 opacity-50">Cargando delicias...</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            <motion.div layout className="contents">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} onClick={setSelectedProduct} />
                                ))}
                            </motion.div>
                        </div>
                    )}
                    
                    {!loading && filteredProducts.length === 0 && (
                        <div className="text-center py-10 text-gray-400">No hay productos en esta sección.</div>
                    )}
                </div>
            </div>

            <Footer />
            <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        </div>
    );
}