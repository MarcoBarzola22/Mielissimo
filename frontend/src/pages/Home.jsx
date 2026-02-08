import React, { useEffect, useState } from 'react';
import { fetchProducts, fetchCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import CategoryPills from '../components/CategoryPills';
import HeroCarousel from '../components/HeroCarousel';
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
        // Fetch Data
        Promise.all([fetchProducts(), fetchCategories()])
            .then(([productsData, categoriesData]) => {
                setProducts(productsData);
                setCategories([{ id: 'todas', nombre: 'Ver Todo' }, { id: 'ofertas', nombre: 'Ofertas 🔥' }, ...categoriesData]);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading data:", err);
                setLoading(false);
            });
    }, []);

    // Filter Logic
    const filteredProducts = products.filter(p => {
        // 1. Search Filter (Priority)
        if (searchQuery && !p.nombre.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // 2. Category Filter
        if (activeCategory.id === 'todas') return true;
        if (activeCategory.id === 'ofertas') return p.es_oferta;
        return p.categorias.some(c => c.id === activeCategory.id) || p.categoria_id === activeCategory.id;
    });

    return (
        <div className="pb-20 bg-[#fff0f5] min-h-screen pt-32">

            {/* 🍬 HERO CAROUSEL (Manual Control) */}
            <HeroCarousel />

            {/* 🏷️ CATEGORY PILLS (Refactored) */}
            <CategoryPills
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
            />

            {/* 📦 PRODUCT GRID */}
            <div className="max-w-7xl mx-auto px-4 mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                        {activeCategory.nombre === 'Ofertas 🔥' ? 'Mostrando Ofertas' : activeCategory.nombre}
                    </h3>
                    <span className="text-sm text-gray-400">{filteredProducts.length} productos</span>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ef5579]"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <motion.div layout className="contents">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} onClick={setSelectedProduct} />
                            ))}
                        </motion.div>
                    </div>
                )}

                {!loading && filteredProducts.length === 0 && (
                    <div className="text-center py-20 flex flex-col items-center opacity-60">
                        <span className="text-4xl mb-2">😢</span>
                        <p className="text-gray-500">No hay productos aquí por ahora.</p>
                    </div>
                )}
            </div>

            <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        </div>
    );
}
