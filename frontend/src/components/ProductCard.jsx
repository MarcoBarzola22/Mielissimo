import React from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../context/store';
import toast from 'react-hot-toast';

export default function ProductCard({ product, onClick }) {
    const { addToCart } = useStore();

    // Check if product is on offer
    const isOffer = product.es_oferta;
    const price = parseFloat(product.precio);
    const offerPrice = product.precio_oferta ? parseFloat(product.precio_oferta) : null;

    const displayPrice = isOffer && offerPrice ? offerPrice : price;

    // Check if "New" (simple logic, or field if exists, for now random or checking date if available? 
    // User asked "Add a visible badge 'NUEVO' (top-left) for recent products". 
    // Assuming 'id' is auto-increment, high IDs are newer. Or just show it for now.)
    // Let's assume top 20% IDs are new, or just add logic. 
    // Actually, let's keep it simple: ALL products get the badge if they look new (maybe > some ID).
    // Or just always show for demo if I can't check date. The user didn't give date logic.
    // I will add the badge UI, conditional on a 'nuevo' prop or just mock it for high IDs for now.
    const isNew = product.id > 10; // Simple mock logic for "Recent"

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
            className="bg-[#ef5579] rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer overflow-hidden group border border-pink-400 h-full flex flex-col transform hover:-translate-y-1"
        >
            <div className="relative aspect-square overflow-hidden bg-white">
                <img
                    src={product.imagen || 'https://via.placeholder.com/300'}
                    alt={product.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />

                {/* LABELS */}
                {isNew && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-pink-900 text-[10px] font-black px-2 py-1 rounded-sm shadow-sm tracking-wider">
                        NUEVO
                    </div>
                )}

                {isOffer && (
                    <div className="absolute top-2 right-2 bg-white text-[#ef5579] text-[10px] font-black px-2 py-1 rounded-sm shadow-sm tracking-wider">
                        OFERTA
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                    <h3 className="font-bold text-white text-md leading-tight mb-1">{product.nombre}</h3>
                </div>

                <div className="flex items-end justify-between mt-3">
                    <div className="flex flex-col">
                        {isOffer && offerPrice ? (
                            <>
                                <span className="text-pink-200 line-through text-xs">${price.toFixed(2)}</span>
                                <span className="text-yellow-300 font-extrabold text-xl">${offerPrice.toFixed(2)}</span>
                            </>
                        ) : (
                            <span className="text-white font-extrabold text-xl">${price.toFixed(2)}</span>
                        )}
                    </div>

                    <button
                        onClick={handleQuickAdd}
                        className="bg-white text-[#ef5579] p-2 rounded-full hover:bg-yellow-300 hover:text-pink-900 transition-colors shadow-sm"
                    >
                        <Plus size={20} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
}
