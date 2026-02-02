import { X, Minus, Plus, Trash2, MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    totalPrice,
    totalItems,
  } = useCart();

  const handleWhatsAppOrder = () => {
    const message = items
      .map(
        (item) =>
          `• ${item.product.name} (${item.variant.name}) x${item.quantity} - $${(item.variant.price * item.quantity).toFixed(2)}`
      )
      .join('%0A');

    const fullMessage = `¡Hola! 🍬 Quiero hacer un pedido:%0A%0A${message}%0A%0A*Total: $${totalPrice.toFixed(2)}*`;
    
    window.open(`https://wa.me/1234567890?text=${fullMessage}`, '_blank');
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-card">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <span className="text-2xl">🛒</span>
            Tu Carrito
            {totalItems > 0 && (
              <span className="ml-auto bg-primary text-primary-foreground text-sm px-2.5 py-0.5 rounded-full">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <span className="text-6xl mb-4">🍬</span>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Tu carrito está vacío
            </h3>
            <p className="text-muted-foreground text-sm">
              ¡Agrega algunas golosinas deliciosas!
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.variant.id}`}
                  className="flex gap-3 p-3 bg-secondary/30 rounded-xl"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {item.variant.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-card rounded-lg shadow-sm">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.variant.id,
                              item.quantity - 1
                            )
                          }
                          className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.variant.id,
                              item.quantity + 1
                            )
                          }
                          className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-semibold text-primary text-sm">
                        ${(item.variant.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id, item.variant.id)}
                    className="self-start p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-medium text-foreground">Total:</span>
                <span className="font-bold text-primary text-xl">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              <Button
                onClick={handleWhatsAppOrder}
                className="w-full h-12 text-base font-semibold rounded-xl gradient-candy hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Pedir por WhatsApp
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
