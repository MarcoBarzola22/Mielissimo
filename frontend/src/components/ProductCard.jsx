import React from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../context/store';
import toast from 'react-hot-toast';

export default function ProductCard({ product, onClick }) {
    const { addToCart, toggleCart } = useStore();

    // Check if product is on offer
    const isOffer = product.es_oferta;
    const price = parseFloat(product.precio);
    const offerPrice = product.precio_oferta ? parseFloat(product.precio_oferta) : null;

    const displayPrice = isOffer && offerPrice ? offerPrice : price;

    const handleQuickAdd = (e) => {
        e.stopPropagation(); // Prevent opening modal

        // If has variants, open modal (fallback to card click)
        if (product.variantes && product.variantes.length > 0) {
            onClick(product);
            return;
        }

        // Add to cart directly
        addToCart(product, null, 1);
        toast.success(`Agregado: ${product.nombre}`);
    };

    return (
        <div
            onClick={() => onClick(product)}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group border border-gray-100 h-full flex flex-col"
        >
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                    src={product.imagen || 'https://via.placeholder.com/300'}
                    alt={product.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
                {isOffer && (
                    <div className="absolute top-2 right-2 bg-brand-pink text-white text-xs font-bold px-2 py-1 rounded-full">
                        OFERTA
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-1 justify-between">
                <h3 className="font-medium text-gray-800 text-lg truncate" title={product.nombre}>{product.nombre}</h3>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col">
                        {isOffer && offerPrice ? (
                            <>
                                <span className="text-gray-400 line-through text-sm">${price.toFixed(2)}</span>
                                <span className="text-brand-pink font-bold text-lg">${offerPrice.toFixed(2)}</span>
                            </>
                        ) : (
                            <span className="text-brand-pink font-bold text-lg">${price.toFixed(2)}</span>
                        )}
                    </div>

                    <button
                        onClick={handleQuickAdd}
                        className="bg-brand-bg text-brand-pink p-2 rounded-full hover:bg-brand-pink hover:text-white transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
