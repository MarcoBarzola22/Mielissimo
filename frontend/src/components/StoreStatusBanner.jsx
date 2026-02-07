import React from 'react';
import { useStore } from '../context/store';
import { AlertCircle } from 'lucide-react';

export default function StoreStatusBanner() {
    const { storeStatus } = useStore();

    if (!storeStatus || storeStatus === 'ABIERTO') return null;

    return (
        <div className="bg-red-600 text-white px-4 py-4 shadow-lg sticky top-0 z-[60] text-center w-full">
            <div className="max-w-7xl mx-auto flex items-center justify-center animate-pulse">
                <AlertCircle size={24} className="mr-3" />
                <span className="font-bold text-base md:text-lg uppercase tracking-wide">
                    ¡El local se encuentra actualmente CERRADO!
                </span>
            </div>
            <p className="text-xs md:text-sm mt-1 opacity-90">
                Podés armar tu pedido, pero lo procesaremos cuando abramos nuevamente.
            </p>
        </div>
    );
}
