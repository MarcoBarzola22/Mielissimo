export interface Variante {
  tipo: string;
  valor: string;
  precio_extra: number;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;        
  precio_oferta: number | null;
  oferta: boolean;
  imagen: string;
  stock: number;
  variantes: Variante[];
  categorias_nombres: string[];
}

export interface CartItem extends Producto {
  cantidad: number;
  varianteSeleccionada?: Variante | null; 
}