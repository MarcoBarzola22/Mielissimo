import { Producto } from "../types/types";

interface ProductCardProps {
  product: Producto;
  onClick: (p: Producto) => void; // Recibimos la función para abrir modal
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const precioMostrar = product.oferta && product.precio_oferta 
    ? product.precio_oferta 
    : product.precio;

  return (
    <div 
        className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-pink-100 cursor-pointer flex flex-col h-full"
        onClick={() => onClick(product)}
    >
      {/* Imagen + Badge Oferta */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.oferta && (
          <span className="absolute top-2 left-2 bg-mielissimo-pink text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-sm animate-pulse">
            OFERTA
          </span>
        )}
        <img
          src={`http://localhost:3000/uploads/${product.imagen}`}
          alt={product.nombre}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          onError={(e) => (e.currentTarget.src = "https://placehold.co/300x300?text=Mielissimo")}
        />
        
        {/* Overlay "Ver más" */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 bg-white text-pink-600 px-4 py-2 rounded-full font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">
                Ver Opciones
            </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-medium text-gray-800 line-clamp-2 mb-1">{product.nombre}</h3>
        
        {/* Categorías pequeñas */}
        <p className="text-xs text-gray-400 mb-2">{product.categorias_nombres?.join(", ")}</p>

        <div className="mt-auto pt-2 flex items-baseline gap-2">
            {product.oferta ? (
                <>
                    <span className="text-lg font-bold text-mielissimo-pink">${Number(precioMostrar).toLocaleString()}</span>
                    <span className="text-sm text-gray-400 line-through decoration-red-400">${Number(product.precio).toLocaleString()}</span>
                </>
            ) : (
                <span className="text-lg font-bold text-gray-900">${Number(product.precio).toLocaleString()}</span>
            )}
        </div>
      </div>
    </div>
  );
};