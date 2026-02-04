import { Producto } from "../types/types";
import { Plus } from "lucide-react";

interface ProductCardProps {
  product: Producto;
  onClick: (p: Producto) => void;
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const precioMostrar = product.oferta && product.precio_oferta 
    ? product.precio_oferta 
    : product.precio;

  return (
    <div 
        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-pink-100/50 cursor-pointer flex flex-col h-full transform hover:-translate-y-1"
        onClick={() => onClick(product)}
    >
      {/* Imagen + Badge */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-pink-50 to-white">
        {product.oferta && (
          <span className="absolute top-3 left-3 bg-red-400 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md backdrop-blur-sm bg-opacity-90">
            ¡OFERTA!
          </span>
        )}
        <img
          src={`http://localhost:3000/uploads/${product.imagen}`}
          alt={product.nombre}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500 ease-in-out"
          onError={(e) => (e.currentTarget.src = "https://placehold.co/300x300/fce7f3/db2777?text=Mielissimo")}
        />
        
        {/* Botón flotante "Ver" */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
            <div className="bg-white text-mielissimo-pink p-2 rounded-full shadow-lg border border-pink-100 hover:bg-mielissimo-pink hover:text-white transition-colors">
                <Plus className="h-6 w-6" />
            </div>
        </div>
      </div>

      {/* Info del Producto */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2">
            <span className="text-[10px] uppercase tracking-wider text-pink-400 font-semibold bg-pink-50 px-2 py-1 rounded-md">
                {product.categorias_nombres?.[0] || "Dulces"}
            </span>
        </div>
        
        <h3 className="font-bold text-gray-800 text-lg leading-tight mb-2 group-hover:text-mielissimo-pink transition-colors">
            {product.nombre}
        </h3>
        
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
            <div className="flex flex-col">
                {product.oferta ? (
                    <>
                        <span className="text-xs text-gray-400 line-through">${Number(product.precio).toLocaleString()}</span>
                        <span className="text-xl font-extrabold text-mielissimo-pink">${Number(precioMostrar).toLocaleString()}</span>
                    </>
                ) : (
                    <span className="text-xl font-bold text-gray-900">${Number(product.precio).toLocaleString()}</span>
                )}
            </div>
            <span className="text-xs text-gray-400 font-medium">Ver opciones</span>
        </div>
      </div>
    </div>
  );
};