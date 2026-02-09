import React from 'react';
import { useStore } from '../context/store';
import { AlertCircle } from 'lucide-react';

export default function StoreStatusBanner() {
    const { storeStatus } = useStore();

    // ============================================
    // MODO FORZADO ACTIVADO (Para probar diseño)
    // ============================================
    const isClosed = true; 
    
    // Cuando quieras que funcione real, borra la línea de arriba y usa esta:
    // const isClosed = String(storeStatus).toUpperCase() === 'CERRADO';

    if (!isClosed) return null;

    return (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white px-4 py-3 shadow-2xl z-[99999] text-center border-b-4 border-red-800 flex justify-center items-center">
            <div className="max-w-7xl flex flex-col md:flex-row items-center justify-center gap-3 animate-pulse">
                <div className="flex items-center gap-2 font-black uppercase tracking-wider text-sm md:text-base bg-red-800 px-3 py-1 rounded-lg">
                    <AlertCircle size={24} className="text-yellow-400" />
                    <span>¡LOCAL CERRADO!</span>
                </div>
                <span className="text-xs md:text-sm font-bold opacity-100">
                    (Modo Prueba Visual Activo)
                </span>
            </div>
        </div>
    );
}