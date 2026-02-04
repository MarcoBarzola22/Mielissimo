import { createContext, useContext, useState, ReactNode } from "react";
import { Product, ProductVariant } from "../data/products";

// Extend Product for Cart Item to include quantity and selected variant
export interface CartItem extends Product {
  cantidad: number;
  varianteSeleccionada?: ProductVariant | null;
  // ensure we have price for total calc (base + variant)
  finalPrice: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variante?: ProductVariant | null) => void;
  removeFromCart: (id: number, variante?: ProductVariant | null) => void;
  updateQuantity: (id: number, quantity: number, variante?: ProductVariant | null) => void;
  clearCart: () => void;
  cartCount: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Product, variante: ProductVariant | null = null) => {
    setItems(currentItems => {
      // Find matches by ID and Variant ID (if exists)
      const existingItem = currentItems.find(item =>
        item.id === product.id &&
        item.varianteSeleccionada?.id === variante?.id
      );

      if (existingItem) {
        return currentItems.map(item =>
          (item.id === product.id && item.varianteSeleccionada?.id === variante?.id)
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      // Calculate base price (offer or regular)
      const basePrice = product.oferta && product.precio_oferta ? Number(product.precio_oferta) : Number(product.precio);
      const extra = variante ? Number(variante.precio_extra) : 0;

      return [...currentItems, {
        ...product,
        finalPrice: basePrice + extra,
        cantidad: 1,
        varianteSeleccionada: variante
      }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number, variante: ProductVariant | null = null) => {
    setItems(items => items.filter(item => !(item.id === id && item.varianteSeleccionada?.id === variante?.id)));
  };

  const updateQuantity = (id: number, quantity: number, variante: ProductVariant | null = null) => {
    if (quantity < 1) return;
    setItems(items => items.map(item =>
      (item.id === id && item.varianteSeleccionada?.id === variante?.id) ? { ...item, cantidad: quantity } : item
    ));
  };

  const clearCart = () => setItems([]);

  const cartCount = items.reduce((acc, item) => acc + item.cantidad, 0);
  const total = items.reduce((acc, item) => acc + (item.finalPrice * item.cantidad), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, total, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error("useCart must be used within a CartProvider");
  return context;
};