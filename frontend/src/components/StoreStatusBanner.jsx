import React from 'react';
import { useStore } from '../context/store';
import { AlertCircle } from 'lucide-react';

export default function StoreStatusBanner() {
    const { storeStatus } = useStore();

    // Lógica real: lee la base de datos
    const status = storeStatus ? String(storeStatus).toUpperCase() : '';
    const isClosed = status === 'CERRADO';

    if (!isClosed) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: 'auto',
            minHeight: '48px', // Altura mínima asegurada
            zIndex: 9999999, // Encima de la Navbar (que suele ser z-50)
            backgroundColor: '#dc2626', // Rojo
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            padding: '10px 20px',
            textAlign: 'center'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <AlertCircle size={24} className="text-yellow-300" />
                <span style={{ fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ¡LOCAL CERRADO!
                </span>
                <span style={{ fontSize: '0.9em', opacity: 0.95 }}>
                    (Los pedidos se procesarán al abrir)
                </span>
            </div>
        </div>
    );
}