export interface ProductVariant {
  id: number;
  tipo: string;
  valor: string;
  precio_extra: number;
  // compatibility with legacy
  name?: string;
  price?: number;
}

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  precio: number;
  oferta: boolean;
  precio_oferta?: number;
  activo: boolean;

  // Relations
  variantes: ProductVariant[];
  categorias_ids: number[];
  categorias_nombres: string[];

  // Legacy / Mapped properties for compatibility
  // We might want to standardize on the backend names gradually
  name?: string;
  description?: string;
  image?: string;
  category?: string;
  is_offer?: boolean; // mapped map
  categoryIds?: number[]; // mapped
}

export interface Category {
  id: number;
  nombre: string;
  emoji: string;
}

export const heroSlides = []; // Deprecated, using API now


