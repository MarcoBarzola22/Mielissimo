import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Producto } from "../types/types";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface HeroCarouselProps {
  products: Producto[];
}

export const HeroCarousel = ({ products }: HeroCarouselProps) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-b from-pink-50 to-white py-8">
      <div className="container mx-auto px-4">
        <Carousel className="w-full rounded-3xl shadow-2xl overflow-hidden">
          <CarouselContent>
            {products.map((product) => (
              <CarouselItem key={product.id}>
                <div className="relative h-[400px] md:h-[500px] w-full">
                  {/* Imagen de Fondo */}
                  <img
                    src={`http://localhost:3000/uploads/${product.imagen}`}
                    alt={product.nombre}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Degradado para texto */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center">
                    <div className="container mx-auto px-8 md:px-16 text-white max-w-2xl">
                      <span className="bg-mielissimo-pink text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-wider mb-4 inline-block shadow-lg">
                        OFERTA ESPECIAL
                      </span>
                      <h2 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">
                        {product.nombre}
                      </h2>
                      <p className="text-lg md:text-xl text-gray-200 mb-8 line-clamp-2 max-w-lg font-light">
                        {product.descripcion || "¡Disfruta de nuestros sabores únicos y deliciosos!"}
                      </p>
                      
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-gray-300 text-sm line-through">Antes ${product.precio}</span>
                            <span className="text-4xl font-bold text-pink-300">${product.precio_oferta}</span>
                        </div>
                        <Button className="bg-white text-pink-600 hover:bg-gray-100 hover:scale-105 transition-all font-bold rounded-full px-8 py-6 text-lg shadow-xl border-2 border-transparent hover:border-pink-200">
                          Comprar Ahora <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Controles flotantes */}
          <CarouselPrevious className="left-4 bg-white/20 hover:bg-white text-white hover:text-pink-600 border-none h-12 w-12" />
          <CarouselNext className="right-4 bg-white/20 hover:bg-white text-white hover:text-pink-600 border-none h-12 w-12" />
        </Carousel>
      </div>
    </div>
  );
};