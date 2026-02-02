import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Minus, Plus } from 'lucide-react';
import { products } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const product = products.find((p) => p.id === id);
  const [selectedVariant, setSelectedVariant] = useState(product?.variants[0]);
  const [quantity, setQuantity] = useState(1);

  if (!product || !selectedVariant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <span className="text-6xl mb-4 block">😕</span>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Producto no encontrado
          </h1>
          <Button onClick={() => navigate('/')} variant="outline" className="mt-4">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedVariant);
    }
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-secondary rounded-xl transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-foreground truncate">
            {product.name}
          </h1>
        </div>
      </header>

      {/* Product Image */}
      <div className="relative aspect-square md:aspect-video max-h-[400px] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.featured && (
          <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
            ⭐ Popular
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Title & Price */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {product.name}
          </h2>
          <p className="text-muted-foreground">{product.description}</p>
        </div>

        {/* Variant Selector */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">
            Selecciona el tamaño:
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`px-5 py-3 rounded-xl font-medium transition-all ${
                  selectedVariant.id === variant.id
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                <span className="block text-sm">{variant.name}</span>
                <span className="block text-xs opacity-80">
                  ${variant.price.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Selector */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">
            Cantidad:
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-secondary rounded-xl overflow-hidden">
              <button
                onClick={decrementQuantity}
                className="p-3 hover:bg-accent transition-colors"
                aria-label="Reducir cantidad"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="w-12 text-center font-semibold text-lg">
                {quantity}
              </span>
              <button
                onClick={incrementQuantity}
                className="p-3 hover:bg-accent transition-colors"
                aria-label="Aumentar cantidad"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Subtotal</p>
              <p className="text-xl font-bold text-primary">
                ${(selectedVariant.price * quantity).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border p-4 safe-area-pb">
        <div className="container mx-auto max-w-md">
          <Button
            onClick={handleAddToCart}
            className="w-full h-14 text-base font-semibold rounded-xl gradient-candy hover:opacity-90 transition-opacity"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Agregar al carrito - ${(selectedVariant.price * quantity).toFixed(2)}
          </Button>
        </div>
      </div>

      {/* Bottom spacing for fixed CTA */}
      <div className="h-24" />
    </div>
  );
}
