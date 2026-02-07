import React, { useEffect, useState } from 'react';
import { fetchProducts, fetchCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import CategoryPills from '../components/CategoryPills';
import { motion } from 'framer-motion';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [activeCategory, setActiveCategory] = useState({ id: 'todas', nombre: 'Ver Todo' }); // DEFAULT CHANGED
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch Banners
        fetch('/api/banners')
            .then(res => res.json())
            .then(data => setBanners(data))
            .catch(err => console.error("Error fetching banners:", err));

        Promise.all([fetchProducts(), fetchCategories()])
            .then(([productsData, categoriesData]) => {
                setProducts(productsData);
                // "Ver Todo" is the default. "Ofertas" is just another category now if desired, or we can keep it at start.
                // User asked: "The App must load showing 'Ver Todo' (All Products) by default, NOT 'Ofertas'."
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
        if (activeCategory.id === 'todas') return true;
        if (activeCategory.id === 'ofertas') return p.es_oferta;
        return p.categorias.some(c => c.id === activeCategory.id) || p.categoria_id === activeCategory.id;
    });

    return (
        <div className="pb-20 bg-[#fff0f5] min-h-screen pt-32"> {/* ADDED pt-32 to fix header overlap */}

            {/* 🍬 HERO CAROUSEL (BANNERS) */}
            {banners.length > 0 && (
                <section className="relative w-full h-[200px] md:h-[300px] overflow-hidden mb-6 mt-4">
                    {/* Simple Slider */}
                    <div className="flex overflow-x-auto snap-x snap-mandatory h-full scrollbar-hide">
                        {banners.map(banner => (
                            <div key={banner.id} className="min-w-full snap-center h-full relative">
                                <img
                                    src={banner.imagen_url}
                                    alt={banner.titulo || 'Banner'}
                                    className="w-full h-full object-cover"
                                />
                                {banner.titulo && (
                                    <div className="absolute bottom-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                                        <h3 className="font-bold text-lg">{banner.titulo}</h3>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

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
                            {filteredProducts.map(product => (
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
