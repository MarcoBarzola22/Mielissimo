import React, { useEffect, useState } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { fetchProducts } from '../services/api';
import { useStore } from '../context/store';
import { motion } from 'framer-motion';

// Hero Carousel: Shows products marked as 'en_carrusel'.
// Style: Full width, single slide, Hero Aesthetic.

export default function HeroCarousel() {
    const [slides, setSlides] = useState([]);

    useEffect(() => {
        fetchProducts().then(products => {
            // Filter explicitly for en_carrusel === 1 (or true) and active
            const carouselProducts = products.filter(p =>
                (p.en_carrusel === 1 || p.en_carrusel === true) && (p.activo === 1 || p.activo === true)
            );
            setSlides(carouselProducts);
        }).catch(console.error);
    }, []);

    if (slides.length === 0) return null;

    const settings = {
        dots: true,
        infinite: slides.length > 1,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        fade: true, // Fade effect for Hero feel
        cssEase: 'linear',
        arrows: false // Cleaner look
    };

    return (
        <div className="w-full mb-8 relative group">
            <Slider {...settings}>
                {slides.map(product => (
                    <div key={product.id} className="relative w-full h-[300px] md:h-[450px] outline-none">
                        {/* Image */}
                        <img
                            src={product.imagen || 'https://via.placeholder.com/800x400'}
                            alt={product.nombre}
                            className="w-full h-full object-cover"
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-start p-8 md:p-16">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-white max-w-2xl"
                            >
                                <span className="inline-block bg-[#ef5579] text-white text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-lg">
                                    DESTACADO
                                </span>
                                <h2 className="text-3xl md:text-5xl font-extrabold mb-2 leading-tight drop-shadow-md">
                                    {product.nombre}
                                </h2>
                                <div className="flex items-center gap-4 mt-4">
                                    <span className="text-2xl md:text-3xl font-bold text-yellow-300">
                                        ${product.precio_oferta || product.precio}
                                    </span>
                                    {(product.precio_oferta > 0) && (
                                        <span className="text-lg text-gray-300 line-through">
                                            ${product.precio}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
}
