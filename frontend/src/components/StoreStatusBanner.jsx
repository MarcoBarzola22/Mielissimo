import React from 'react';
import { useStore } from '../context/store';
import { AlertCircle } from 'lucide-react';

export default function StoreStatusBanner() {
    const { storeStatus } = useStore();

    // === LOGIC ===
    // Cambia esto a 'false' SOLO cuando confirmes que ves el cartel rojo.
    const FORCE_SHOW = true;
    const status = storeStatus ? String(storeStatus).toUpperCase() : '';
    const isClosed = FORCE_SHOW || status === 'CERRADO';

    if (!isClosed) return null;

    return (
        // COMPONENTE BLINDADO: Fixed, Top 0, Z-Index Millonario
        <div style={{
            position: 'fixed',
            top: '0px',
            left: '0px',
            width: '100vw',
            height: 'auto',
            zIndex: '2147483647', /* Max Z-Index seguro */
            backgroundColor: '#dc2626',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '10px 0',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            textAlign: 'center'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '90%' }}>
                <AlertCircle size={28} color="#fbbf24" strokeWidth={3} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '16px', lineHeight: '1' }}>
                        ¡TIENDA CERRADA!
                    </span>
                    <span style={{ fontSize: '12px', opacity: 0.9 }}>
                        No estamos tomando pedidos ahora.
                    </span>
                </div>
            </div>
        </div>
    );
}