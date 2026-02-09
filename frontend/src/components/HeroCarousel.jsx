import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronRight, ChevronLeft, ShoppingBag, Flame, Star } from 'lucide-react';
import { motion } from 'framer-motion';

// Custom Arrows
const NextArrow = ({ onClick, style, className }) => (
    <div
        className={`${className} !z-30`}
        style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', right: '20px', width: '50px', height: '50px' }}
        onClick={onClick}
    >
        <div className="bg-white/20 backdrop-blur-sm text-white hover:bg-white hover:text-[#ef5579] p-3 rounded-full shadow-lg transition-all duration-300 cursor-pointer flex items-center justify-center border border-white/30">
            <ChevronRight size={30} strokeWidth={2.5} />
        </div>
    </div>
);

const PrevArrow = ({ onClick, style, className }) => (
    <div
        className={`${className} !z-30`}
        style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', left: '20px', width: '50px', height: '50px' }}
        onClick={onClick}
    >
        <div className="bg-white/20 backdrop-blur-sm text-white hover:bg-white hover:text-[#ef5579] p-3 rounded-full shadow-lg transition-all duration-300 cursor-pointer flex items-center justify-center border border-white/30">
            <ChevronLeft size={30} strokeWidth={2.5} />
        </div>
    </div>
);

export default function HeroCarousel({ onSelectCategory }) {

    const settings = {
        dots: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 6000,
        arrows: true,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        fade: true,
        cssEase: 'cubic-bezier(0.87, 0, 0.13, 1)',
        pauseOnHover: false,
        appendDots: dots => (
            <div style={{ bottom: "30px" }}>
                <ul style={{ margin: "0px" }}> {dots} </ul>
            </div>
        ),
        customPaging: i => (
            <div className="w-3 h-3 bg-white/40 rounded-full hover:bg-white transition-all duration-300 mt-4"></div>
        )
    };

    const slides = [
        {
            id: 1,
            title: "¡Bienvenidos a Mielissimo!",
            subtitle: "Dulzura en cada detalle",
            description: "Descubrí el auténtico sabor artesanal. Elaboramos cada producto con pasión y los mejores ingredientes para endulzar tus momentos especiales.",
            bg: "from-[#ef5579] to-[#ff90af]",
            icon: null,
            buttonText: null,
            action: null,
            image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" // Cake image
        },
        {
            id: 2,
            title: "Ofertas Maravillosas",
            subtitle: "Precios increíbles",
            description: "Aprovechá nuestros descuentos exclusivos por tiempo limitado. ¡No te pierdas la oportunidad de disfrutar más por menos!",
            bg: "from-[#ff7e5f] to-[#feb47b]", // Warm sunset gradient
            icon: <Flame size={24} />,
            buttonText: "Ver Ofertas",
            action: () => {
                if (onSelectCategory) {
                    onSelectCategory({ id: 'ofertas', nombre: 'Ofertas 🔥' });
                }
            },
            image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" // Cupcakes/Offer image
        },
        {
            id: 3,
            title: "Golosinas Exclusivas",
            subtitle: "Solo lo mejor para vos",
            description: "Una selección premium de golosinas importadas y creaciones únicas. Date un gusto que no vas a encontrar en otro lado.",
            bg: "from-[#8e2de2] to-[#4a00e0]", // Purple gradient
            icon: <Star size={24} />,
            buttonText: "Ver Productos",
            action: () => {
                const productsSection = document.getElementById('products-section');
                if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                    window.scrollTo({ top: 800, behavior: 'smooth' });
                }
            },
            image: "https://images.unsplash.com/photo-1582058928232-21683692a75f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" // Candies image
        }
    ];

    return (
        <div className="w-full relative shadow-2xl mb-8 overflow-hidden font-sans">
            <Slider {...settings}>
                {slides.map((slide) => (
                    <div key={slide.id} className="outline-none relative">
                        {/* Background with Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg} opacity-90 z-0`}></div>

                        {/* Background Image (Optional - Low opacity for texture) */}
                        <div
                            className="absolute inset-0 z-0 opacity-10 blur-[2px]"
                            style={{
                                backgroundImage: `url('https://www.transparenttextures.com/patterns/cubes.png')`,
                                backgroundSize: 'auto'
                            }}
                        ></div>

                        <div className="flex flex-col-reverse md:flex-row h-auto min-h-[550px] items-center justify-center max-w-7xl mx-auto px-6 py-16 md:py-0 gap-12 relative z-10">

                            {/* Left: Text Content */}
                            <div className="flex-1 text-center md:text-left text-white flex flex-col items-center md:items-start space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                >
                                    <span className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-md text-sm font-bold tracking-widest uppercase mb-4 border border-white/20 shadow-sm">
                                        {slide.subtitle}
                                    </span>

                                    <h1 className="text-5xl md:text-7xl font-black leading-tight drop-shadow-lg tracking-tight mb-4">
                                        {slide.title}
                                    </h1>

                                    <p className="text-lg md:text-xl font-medium opacity-90 max-w-xl leading-relaxed text-pink-50 mb-8">
                                        {slide.description}
                                    </p>

                                    {slide.buttonText && (
                                        <motion.button
                                            whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={slide.action}
                                            className="px-10 py-4 bg-white text-gray-900 font-bold rounded-full shadow-xl transition-all flex items-center gap-3 text-lg group mx-auto md:mx-0"
                                        >
                                            <span className="group-hover:-rotate-12 transition-transform duration-300 text-[#ef5579]">
                                                {slide.icon || <ShoppingBag />}
                                            </span>
                                            {slide.buttonText}
                                        </motion.button>
                                    )}
                                </motion.div>
                            </div>

                            {/* Right: Image */}
                            <div className="flex-1 w-full flex justify-center items-center relative perspective-1000">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
                                    whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="relative"
                                >
                                    <div className="absolute inset-0 bg-white/30 blur-3xl rounded-full transform scale-90"></div>
                                    <img
                                        src={slide.image}
                                        alt={slide.title}
                                        className="relative z-10 max-h-[350px] md:max-h-[480px] w-auto object-cover rounded-3xl shadow-2xl border-4 border-white/20 transform hover:scale-[1.02] transition-transform duration-500"
                                    />

                                    {/* Floating Badges Decoration */}
                                    {slide.id === 2 && (
                                        <motion.div
                                            animate={{ y: [0, -15, 0] }}
                                            transition={{ repeat: Infinity, duration: 4 }}
                                            className="absolute -top-6 -right-6 bg-yellow-400 text-red-600 font-black text-xl w-24 h-24 rounded-full flex items-center justify-center shadow-lg border-4 border-white rotate-12 z-20"
                                        >
                                            SALE
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
}
