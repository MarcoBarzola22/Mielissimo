import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useStore } from '../context/store';

export default function StoreStatusBanner() {
    const { storeStatus } = useStore();

    // Force visibility logic: Case insensitive check
    const isClosed = String(storeStatus).toUpperCase() === 'CERRADO';

    if (!isClosed) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '40px', // Slightly thinner for better aesthetics
            zIndex: 9999999, // Force over everything
            backgroundColor: '#dc2626', // Strong red
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
            letterSpacing: '1px'
        }}>
            <AlertCircle size={18} style={{ marginRight: '8px' }} />
            <span>⚠️ TIENDA MOMENTÁNEAMENT CERRADA - NO SE ESTÁN TOMANDO PEDIDOS</span>
        </div>
    );
}