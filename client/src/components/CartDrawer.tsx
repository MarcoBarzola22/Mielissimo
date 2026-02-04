import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { Trash2, Plus, Minus, MessageCircle, Store, Truck } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";

const ZONES = [
  { id: "zona1", name: "Zona 1 (Centro)", price: 500 },
  { id: "zona2", name: "Zona 2 (Barrios aledaños)", price: 800 },
  { id: "zona3", name: "Zona 3 (Periferia)", price: 1200 },
];

export const CartDrawer = () => {
  const { items, removeFromCart, updateQuantity, total, isCartOpen, setIsCartOpen, clearCart } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");

  const deliveryCost = deliveryMethod === "delivery"
    ? (ZONES.find(z => z.id === selectedZone)?.price || 0)
    : 0;

  const finalTotal = total + deliveryCost;

  const isStoreOpen = () => {
    const now = new Date();
    const hour = now.getHours();
    // Example: Open 9am to 9pm (21:00)
    return hour >= 9 && hour < 21;
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!customerName.trim()) {
      toast.error("Por favor ingresa tu nombre");
      return;
    }
    if (deliveryMethod === "delivery" && !selectedZone) {
      toast.error("Selecciona una zona de envío");
      return;
    }

    const isOpen = isStoreOpen();
    const orderId = `PED-${Math.floor(Math.random() * 100000)}`;

    // Save order to backend
    try {
      await axios.post('http://localhost:3000/api/orders', {
        id: orderId,
        customer_name: customerName,
        customer_contact: customerContact, // Optional
        total: finalTotal,
        delivery_method: deliveryMethod,
        delivery_zone: deliveryMethod === 'delivery' ? ZONES.find(z => z.id === selectedZone)?.name : null,
        items: items
      });
    } catch (error) {
      console.error("Error saving order:", error);
      // Continue anyway to WhatsApp
    }

    // Construct WhatsApp Message
    let message = `*Hola Mielissimo! Soy ${customerName}.*\n`;
    message += `Pedido: *${orderId}*\n\n`;
    items.forEach(item => {
      message += `• ${item.cantidad}x ${item.nombre}`;
      if (item.varianteSeleccionada) {
        message += ` (${item.varianteSeleccionada.tipo}: ${item.varianteSeleccionada.valor})`;
      }
      message += ` - $${(item.finalPrice * item.cantidad).toLocaleString()}\n`;
    });

    message += `\n*Método de entrega:* ${deliveryMethod === "pickup" ? "Retiro en local" : "Envío a domicilio"}`;
    if (deliveryMethod === "delivery") {
      const zoneName = ZONES.find(z => z.id === selectedZone)?.name;
      message += `\n*Zona:* ${zoneName} ($${deliveryCost})`;
    }

    message += `\n\n*TOTAL: $${finalTotal.toLocaleString()}*`;

    if (!isOpen) {
      message += `\n\n(Sé que el local está cerrado, dejo mi pedido para cuando abran).`;
    }

    const whatsappUrl = `https://wa.me/5491112345678?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
    clearCart();
    setIsCartOpen(false);
    toast.success("¡Pedido enviado a WhatsApp!");
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-white overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-mielissimo-pink">Mi Pedido</SheetTitle>
        </SheetHeader>

        {!isStoreOpen() && (
          <div className="bg-amber-100 text-amber-800 p-3 rounded-lg text-sm mb-2 mt-2">
            ⚠️ Estamos cerrados (9am - 9pm). Podés dejar tu pedido y te respondemos al abrir.
          </div>
        )}

        <div className="flex-1 flex flex-col gap-4">
          <ScrollArea className="flex-none max-h-[40vh]">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <p>Tu carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-4 py-4 pr-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.varianteSeleccionada?.id}`} className="flex gap-4">
                    <div className="h-20 w-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      <img
                        src={item.imagen ? `http://localhost:3000/uploads/${item.imagen}` : '/placeholder.png'}
                        alt={item.nombre}
                        className="h-full w-full object-cover"
                        onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm line-clamp-1">{item.nombre}</h4>
                      {item.varianteSeleccionada && (
                        <p className="text-xs text-gray-500">
                          {item.varianteSeleccionada.tipo}: {item.varianteSeleccionada.valor}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-mielissimo-pink">
                          ${(item.finalPrice * item.cantidad).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.cantidad - 1, item.varianteSeleccionada)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm w-4 text-center">{item.cantidad}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.cantidad + 1, item.varianteSeleccionada)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeFromCart(item.id, item.varianteSeleccionada)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <Separator />

          {/* Opciones de Entrega */}
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tu Nombre</Label>
              <Input
                placeholder="Nombre para el pedido"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <RadioGroup
              defaultValue="pickup"
              value={deliveryMethod}
              onValueChange={(v: "pickup" | "delivery") => setDeliveryMethod(v)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 border p-3 rounded-lg flex-1 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup" className="cursor-pointer flex items-center gap-2">
                  <Store className="w-4 h-4" /> Retiro
                </Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-lg flex-1 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery" className="cursor-pointer flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Envío
                </Label>
              </div>
            </RadioGroup>

            {deliveryMethod === "delivery" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label>Zona de Envío</Label>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar zona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ZONES.map(zone => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name} (+${zone.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="mt-auto pt-4 border-t">
          <div className="w-full space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>${total.toLocaleString()}</span>
            </div>
            {deliveryMethod === "delivery" && (
              <div className="flex justify-between items-center text-sm text-blue-600">
                <span>Envío</span>
                <span>+${deliveryCost.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total</span>
              <span>${finalTotal.toLocaleString()}</span>
            </div>
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white gap-2 font-bold py-6"
              onClick={handleCheckout}
              disabled={items.length === 0}
            >
              <MessageCircle className="h-5 w-5" />
              Enviar Pedido por WhatsApp
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
