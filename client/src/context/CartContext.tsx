import { createContext, useContext, useState, ReactNode } from "react";
import { CartItem, Producto, Variante } from "../types/types"; // Ajusta la ruta según donde creaste el archivo

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Producto, variante?: Variante | null) => void;
  removeFromCart: (id: number, variante?: Variante | null) => void;
  updateQuantity: (id: number, quantity: number, variante?: Variante | null) => void;
  clearCart: () => void;
  cartCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Producto, variante: Variante | null = null) => {
    setItems(currentItems => {
      // Buscamos si ya existe el producto con ESA MISMA variante
      const existingItem = currentItems.find(item => 
        item.id === product.id && 
        JSON.stringify(item.varianteSeleccionada) === JSON.stringify(variante)
      );

      if (existingItem) {
        return currentItems.map(item =>
          (item.id === product.id && JSON.stringify(item.varianteSeleccionada) === JSON.stringify(variante))
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      // Si es nuevo, calculamos el precio final (Base + Variante)
      const precioBase = product.oferta && product.precio_oferta ? Number(product.precio_oferta) : Number(product.precio);
      const extra = variante ? Number(variante.precio_extra) : 0;
      
      return [...currentItems, { 
        ...product, 
        precio: precioBase + extra, // Guardamos precio final
        cantidad: 1, 
        varianteSeleccionada: variante 
      }];
    });
  };

  const removeFromCart = (id: number, variante: Variante | null = null) => {
    setItems(items => items.filter(item => !(item.id === id && JSON.stringify(item.varianteSeleccionada) === JSON.stringify(variante))));
  };

  const updateQuantity = (id: number, quantity: number, variante: Variante | null = null) => {
    if (quantity < 1) return;
    setItems(items =>
      items.map(item =>
        (item.id === id && JSON.stringify(item.varianteSeleccionada) === JSON.stringify(variante))
          ? { ...item, cantidad: quantity }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const cartCount = items.reduce((acc, item) => acc + item.cantidad, 0);
  const total = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};