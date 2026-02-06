import React from 'react';
import { useStore } from '../context/store';
import { AlertCircle } from 'lucide-react';

export default function StoreStatusBanner() {
    const { storeStatus } = useStore();

    if (storeStatus === 'ABIERTO') return null;

    return (
        <div className="bg-brand-pink text-white px-4 py-3 shadow-md">
            <div className="max-w-7xl mx-auto flex items-center justify-center">
                <AlertCircle size={20} className="mr-2" />
                <span className="font-medium text-sm md:text-base">
                    El local se encuentra actualmente <strong>CERRADO</strong>. Podés hacer pedidos, pero se procesarán al abrir.
                </span>
            </div>
        </div>
    );
}
