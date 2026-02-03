import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Producto } from "../types/types"; // Importar tipo

// Definir Props
interface HeroCarouselProps {
  products: Producto[];
}

export const HeroCarousel = ({ products }: HeroCarouselProps) => {
  return (
    <div className="w-full bg-pink-50 py-4">
      <Carousel className="w-full max-w-5xl mx-auto">
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem key={product.id}>
              <div className="relative h-[300px] md:h-[400px] w-full rounded-2xl overflow-hidden cursor-pointer">
                <img
                  src={`http://localhost:3000/uploads/${product.imagen}`}
                  alt={product.nombre}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                  <span className="bg-mielissimo-pink px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">
                    OFERTA
                  </span>
                  <h2 className="text-3xl font-bold">{product.nombre}</h2>
                  <p className="text-xl font-medium">
                     ${product.precio_oferta} <span className="line-through text-sm opacity-70">${product.precio}</span>
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  );
};