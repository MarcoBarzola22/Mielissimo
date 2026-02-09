import React, { useEffect } from 'react';
import { useStore } from '../context/store';
import { AlertCircle } from 'lucide-react';

export default function StoreStatusBanner() {
    const { storeStatus } = useStore();

    // === MODO DIAGNÓSTICO: SI ESTO ESTÁ EN TRUE, EL CARTEL DEBE SALIR SÍ O SÍ ===
    const FORCE_SHOW = true; 
    
    // Lógica real (se usará cuando cambies FORCE_SHOW a false)
    const status = storeStatus ? String(storeStatus).toUpperCase() : '';
    const isClosed = FORCE_SHOW || status === 'CERRADO';

    if (!isClosed) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            zIndex: 999999, /* Más alto que el Navbar */
            backgroundColor: '#dc2626',
            color: 'white',
            textAlign: 'center',
            padding: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={24} color="#fbbf24" />
                <span style={{ fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    ¡LOCAL CERRADO!
                </span>
                <span style={{ fontSize: '0.9em', opacity: 0.9 }}>
                    (Tus pedidos se procesarán al abrir)
                </span>
            </div>
        </div>
    );
}