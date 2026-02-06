import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useStore } from '../context/store';

export default function ProductModal({ product, onClose }) {
    const { addToCart, toggleCart } = useStore();
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (product) {
            setQuantity(1);
            setSelectedVariant(null);
        }
    }, [product]);

    if (!product) return null;

    const hasVariants = product.variantes && product.variantes.length > 0;

    const handleAddToCart = () => {
        addToCart(product, selectedVariant, quantity);
        onClose();
        toast.success("Agregado al carrito");
        // toggleCart(); // Optional: Open cart or just show toast
    };

    // Calculate Price
    const basePrice = product.es_oferta && product.precio_oferta
        ? parseFloat(product.precio_oferta)
        : parseFloat(product.precio);

    const variantPrice = selectedVariant && selectedVariant.precio_extra
        ? parseFloat(selectedVariant.precio_extra)
        : 0;

    const finalPrice = basePrice + variantPrice;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 content-center"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition-all shadow-sm"
                    >
                        <X size={20} />
                    </button>

                    {/* Image Area - Fixed Blur */}
                    <div className="relative h-72 bg-gray-100">
                        <img
                            src={product.imagen || 'https://via.placeholder.com/400'}
                            alt={product.nombre}
                            className="w-full h-full object-cover"
                        />
                        {product.es_oferta && (
                            <div className="absolute bottom-4 left-4 bg-brand-pink text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                ¡OFERTA!
                            </div>
                        )}
                    </div>

                    <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-2xl font-bold text-gray-800 leading-tight">{product.nombre}</h2>
                        </div>

                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-3xl font-bold text-[#ef5579]">${finalPrice.toFixed(2)}</span>
                            {product.es_oferta && product.precio_oferta && (
                                <span className="text-gray-400 line-through text-lg">${parseFloat(product.precio).toFixed(2)}</span>
                            )}
                        </div>

                        {/* Variants */}
                        {hasVariants && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Elige una opción:</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {product.variantes.map(v => {
                                        const isSelected = selectedVariant?.id === v.id;
                                        return (
                                            <button
                                                key={v.id}
                                                onClick={() => setSelectedVariant(v)}
                                                className={`
                                                    relative px-4 py-3 rounded-xl text-sm font-medium border-2 text-left transition-all
                                                    ${isSelected
                                                        ? 'border-[#ef5579] bg-pink-50 text-[#ef5579] shadow-sm'
                                                        : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-pink-200'
                                                    }
                                                `}
                                            >
                                                <div className="flex justify-between items-center w-full">
                                                    <span>{v.nombre}</span>
                                                    {isSelected && <Check size={16} />}
                                                </div>
                                                {v.precio_extra > 0 && (
                                                    <span className="text-xs opacity-70 block mt-1">+ ${v.precio_extra}</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-100">
                            {/* Quantity */}
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-3 hover:bg-white rounded-lg transition-colors text-gray-600"
                                >-</button>
                                <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="p-3 hover:bg-white rounded-lg transition-colors text-gray-600"
                                >+</button>
                            </div>

                            {/* Add Button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={hasVariants && !selectedVariant}
                                className={`
                                    flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98]
                                    ${hasVariants && !selectedVariant
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-[#ef5579] hover:bg-[#e23e65] shadow-pink-200'
                                    }
                                `}
                            >
                                {hasVariants && !selectedVariant ? 'Elige una opción' : 'Agregar al Pedido'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}


