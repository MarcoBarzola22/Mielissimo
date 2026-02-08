import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { fetchProducts } from '../services/api';
import { ChevronRight, ChevronLeft, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductModal from './ProductModal';

// Custom Visible Arrows
const NextArrow = ({ onClick, style, className }) => (
    <div
        className={`${className} !z-30`}
        style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', right: '20px', width: '50px', height: '50px' }}
        onClick={onClick}
    >
        <div className="bg-white text-[#ef5579] p-3 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer flex items-center justify-center">
            <ChevronRight size={30} strokeWidth={3} />
        </div>
    </div>
);

const PrevArrow = ({ onClick, style, className }) => (
    <div
        className={`${className} !z-30`}
        style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', left: '20px', width: '50px', height: '50px' }}
        onClick={onClick}
    >
        <div className="bg-white text-[#ef5579] p-3 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer flex items-center justify-center">
            <ChevronLeft size={30} strokeWidth={3} />
        </div>
    </div>
);

export default function HeroCarousel() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetchProducts().then(data => {
            // Filter active in carousel
            const featured = data.filter(p => (p.en_carrusel === 1 || p.en_carrusel === true) && (p.activo === 1 || p.activo === true));
            setProducts(featured);
        });
    }, []);

    if (products.length === 0) return null;

    const settings = {
        dots: true,
        infinite: products.length > 1,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        arrows: true,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        fade: true,
        cssEase: 'linear'
    };

    return (
        <div className="w-full relative bg-gradient-to-r from-[#ef5579] to-[#ff90af] shadow-2xl mb-8 overflow-hidden">
            <Slider {...settings}>
                {products.map(product => (
                    <div key={product.id} className="outline-none">
                        <div className="flex flex-col-reverse md:flex-row h-auto min-h-[500px] items-center justify-center max-w-7xl mx-auto px-6 py-12 md:py-0 gap-8">

                            {/* Left: Text */}
                            <div className="flex-1 text-center md:text-left text-white z-10 flex flex-col items-center md:items-start">
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    {product.carrusel_etiqueta && product.carrusel_etiqueta !== 'NINGUNO' && (
                                        <span className={`
                                            inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-md mb-4
                                            ${product.carrusel_etiqueta === 'NUEVO' ? 'bg-yellow-400 text-pink-900 animate-pulse' : ''}
                                            ${product.carrusel_etiqueta === 'OFERTA' ? 'bg-white text-[#ef5579]' : ''}
                                            ${product.carrusel_etiqueta === 'DESTACADO' ? 'bg-purple-600 text-white' : ''}
                                        `}>
                                            {product.carrusel_etiqueta}
                                        </span>
                                    )}

                                    <h1 className="text-4xl md:text-6xl font-black leading-tight drop-shadow-md mb-4">
                                        {product.nombre}
                                    </h1>

                                    <p className="text-lg md:text-2xl font-medium opacity-95 max-w-xl leading-relaxed text-pink-50">
                                        {product.descripcion_carrusel || product.descripcion || 'Descubrí el sabor único de nuestros productos artesanales.'}
                                    </p>

                                    <div className="mt-8">
                                        <button
                                            onClick={() => setSelectedProduct(product)}
                                            className="px-10 py-4 bg-white text-[#ef5579] font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3 text-lg group"
                                        >
                                            <ShoppingBag className="group-hover:-rotate-12 transition-transform" />
                                            Ver Producto
                                        </button>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right: Image */}
                            <div className="flex-1 w-full flex justify-center items-center relative">
                                <motion.img
                                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ duration: 0.7 }}
                                    src={product.imagen || 'https://via.placeholder.com/500'}
                                    alt={product.nombre}
                                    className="max-h-[350px] md:max-h-[450px] w-auto object-contain drop-shadow-2xl filter brightness-105"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>

            <ProductModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    );
}
