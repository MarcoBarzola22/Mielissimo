import { create } from 'zustand';

export const useStore = create((set, get) => ({
    // Carrito
    cart: [],
    isCartOpen: false,
    toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    addToCart: (product, variant = null, cantidad = 1) => set((state) => {
        // Generate unique ID for item in cart (considering variants)
        const cartItemId = variant ? `${product.id}-${variant.id}` : `${product.id}`;

        const existingItem = state.cart.find(item => item.cartItemId === cartItemId);

        if (existingItem) {
            return {
                cart: state.cart.map(item =>
                    item.cartItemId === cartItemId
                        ? { ...item, cantidad: item.cantidad + cantidad }
                        : item
                )
            };
        }

        return {
            cart: [...state.cart, {
                ...product,
                variant, // Selected variant object (optional)
                cantidad,
                cartItemId
            }]
        };
    }),
    removeFromCart: (cartItemId) => set((state) => ({
        cart: state.cart.filter(item => item.cartItemId !== cartItemId)
    })),
    updateQuantity: (cartItemId, delta) => set((state) => ({
        cart: state.cart.map(item => {
            if (item.cartItemId === cartItemId) {
                const newQty = item.cantidad + delta;
                return newQty > 0 ? { ...item, cantidad: newQty } : item;
            }
            return item;
        })
    })),
    clearCart: () => set({ cart: [] }),

    // Configuración Global
    storeStatus: 'ABIERTO', // ABIERTO | CERRADO
    setStoreStatus: (status) => set({ storeStatus: status }),
}));
