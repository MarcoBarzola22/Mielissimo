import React from 'react';
import { useStore } from '../context/store';
import { AlertCircle } from 'lucide-react';

export default function StoreStatusBanner() {
    const { storeStatus } = useStore();

    // Robust check: Normalize input to upper case safely
    const status = storeStatus ? String(storeStatus).toUpperCase() : '';
    const isClosed = status === 'CERRADO';

    if (!isClosed) return null;

    return (
        <div className="bg-red-600 text-white px-4 py-3 shadow-lg sticky top-0 z-[60] text-center w-full border-b border-red-800">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-2 animate-pulse">
                <div className="flex items-center gap-2 font-black uppercase tracking-wider text-sm md:text-base">
                    <AlertCircle size={20} />
                    <span>¡El local está cerrado!</span>
                </div>
                <span className="text-xs md:text-sm font-medium opacity-90">
                    Tu pedido será procesado cuando volvamos a abrir.
                </span>
            </div>
        </div>
    );
}
