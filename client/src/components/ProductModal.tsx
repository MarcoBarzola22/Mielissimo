import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Producto, Variante } from "../types/types";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface ProductModalProps {
  producto: Producto | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal = ({ producto, isOpen, onClose }: ProductModalProps) => {
  const { addToCart } = useCart();
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<Variante | null>(null);

  if (!producto) return null;

  // Calcular precio final (Precio base o de oferta + extra variante)
  const precioBase = producto.oferta && producto.precio_oferta ? Number(producto.precio_oferta) : Number(producto.precio);
  const precioFinal = varianteSeleccionada ? precioBase + Number(varianteSeleccionada.precio_extra) : precioBase;

  const handleAddToCart = () => {
    if (producto.variantes.length > 0 && !varianteSeleccionada) {
      toast.error("Selecciona una variante");
      return;
    }
    // Llama a addToCart(producto, variante)
    addToCart(producto, varianteSeleccionada); 
    
    toast.success("Agregado al carrito");
    onClose();
};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-mielissimo-pink">{producto.nombre}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Imagen */}
          <div className="w-full h-48 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
             <img 
                src={`http://localhost:3000/uploads/${producto.imagen}`} 
                alt={producto.nombre} 
                className="object-contain h-full w-full"
                onError={(e) => (e.currentTarget.src = '/placeholder.png')}
             />
          </div>

          {/* Precios */}
          <div className="flex items-end gap-2">
            {producto.oferta && (
                <span className="text-gray-400 line-through text-sm">
                    ${Number(producto.precio).toLocaleString()}
                </span>
            )}
            <span className="text-2xl font-bold text-mielissimo-pink">
                ${precioFinal.toLocaleString()}
            </span>
          </div>

          {/* Descripción */}
          <DialogDescription>
            {producto.descripcion || "Sin descripción disponible."}
          </DialogDescription>

          {/* Selector de Variantes */}
          {producto.variantes.length > 0 && (
            <div className="space-y-2 border p-3 rounded-lg bg-pink-50 border-pink-100">
              <h4 className="font-medium text-sm">Elige una opción:</h4>
              <div className="flex flex-wrap gap-2">
                {producto.variantes.map((v, idx) => (
                  <button
                    key={idx}
                    onClick={() => setVarianteSeleccionada(v)}
                    className={`px-3 py-1 text-sm rounded-full border transition-all ${
                      varianteSeleccionada === v
                        ? "bg-mielissimo-pink text-white border-mielissimo-pink"
                        : "bg-white text-gray-700 hover:border-mielissimo-pink"
                    }`}
                  >
                    {v.tipo}: {v.valor} {Number(v.precio_extra) > 0 && `(+$${v.precio_extra})`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button onClick={handleAddToCart} className="w-full bg-mielissimo-pink hover:bg-pink-600 text-white font-bold py-3">
          Agregar al Pedido - ${precioFinal.toLocaleString()}
        </Button>
      </DialogContent>
    </Dialog>
  );
};