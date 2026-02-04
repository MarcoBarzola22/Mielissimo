import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Trash2, Plus, Minus } from "lucide-react";

export const CartDrawer = () => {
  const { items, removeFromCart, updateQuantity, total, isCartOpen, setIsCartOpen } = useCart();

  // Función para armar mensaje de WhatsApp
  const handleCheckout = () => {
    const pedidoId = Date.now().toString().slice(-6); // ID corto seguro
    let mensaje = `Hola Mielissimo! 🐝\nQuiero realizar el pedido #${pedidoId}\n\n`;
    
    items.forEach(item => {
      mensaje += `• ${item.nombre} x${item.cantidad}`;
      if(item.varianteSeleccionada) mensaje += ` (${item.varianteSeleccionada.tipo}: ${item.varianteSeleccionada.valor})`;
      mensaje += ` - $${(item.precio * item.cantidad).toLocaleString()}\n`;
    });
    
    mensaje += `\n💰 Total: $${total.toLocaleString()}`;
    // (Aquí luego agregaremos lógica de envío)
    
    const url = `https://wa.me/549XXXXXX?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-white">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center justify-between">
            <span>Tu Carrito 🛒</span>
            <span className="text-mielissimo-pink text-lg">${total.toLocaleString()}</span>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 mt-10">
              <span className="text-4xl">😢</span>
              <p>El carrito está vacío</p>
              <Button variant="outline" onClick={() => setIsCartOpen(false)}>Ver productos</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.id}-${item.varianteSeleccionada?.valor}`} className="flex gap-4 border-b pb-4 last:border-0">
                  <div className="h-20 w-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img 
                        src={`http://localhost:3000/uploads/${item.imagen}`} 
                        alt={item.nombre} 
                        className="h-full w-full object-cover"
                        onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-medium line-clamp-1">{item.nombre}</h4>
                      {item.varianteSeleccionada && (
                          <p className="text-xs text-gray-500">{item.varianteSeleccionada.tipo}: {item.varianteSeleccionada.valor}</p>
                      )}
                      <p className="text-sm font-bold text-mielissimo-pink">${item.precio}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.cantidad - 1, item.varianteSeleccionada)}><Minus className="h-3 w-3" /></Button>
                      <span className="text-sm w-4 text-center">{item.cantidad}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.cantidad + 1, item.varianteSeleccionada)}><Plus className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 ml-auto" onClick={() => removeFromCart(item.id, item.varianteSeleccionada)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t pt-4 space-y-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${total.toLocaleString()}</span>
          </div>
          <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-6 text-lg" disabled={items.length === 0} onClick={handleCheckout}>
            Completar Pedido por WhatsApp 📲
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};