export interface ProductVariant {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  variants: ProductVariant[];
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
}


