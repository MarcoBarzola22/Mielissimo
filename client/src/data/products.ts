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

export const categories: Category[] = [
  { id: "all", name: "Todos", emoji: "🍬" },
  { id: "gummies", name: "Gomitas", emoji: "🐻" },
  { id: "chocolates", name: "Chocolates", emoji: "🍫" },
  { id: "lollipops", name: "Paletas", emoji: "🍭" },
  { id: "sour", name: "Ácidos", emoji: "🍋" },
  { id: "licorice", name: "Regaliz", emoji: "🖤" },
  { id: "marshmallows", name: "Malvaviscos", emoji: "☁️" },
  { id: "caramels", name: "Caramelos", emoji: "🍯" },
  { id: "jellybeans", name: "Jelly Beans", emoji: "🫘" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Ositos de Goma Premium",
    description: "Deliciosos ositos de goma con sabores frutales intensos. Textura suave y masticable perfecta.",
    image: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400&h=400&fit=crop",
    category: "gummies",
    variants: [
      { id: "1-100", name: "100g", price: 3.99 },
      { id: "1-250", name: "250g", price: 8.99 },
      { id: "1-500", name: "500g", price: 15.99 },
    ],
    featured: true,
  },
  {
    id: "2",
    name: "Chocolates Belgas Surtidos",
    description: "Selección exclusiva de chocolates belgas con rellenos variados: avellana, caramelo y frambuesa.",
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=400&fit=crop",
    category: "chocolates",
    variants: [
      { id: "2-100", name: "100g", price: 6.99 },
      { id: "2-250", name: "250g", price: 14.99 },
      { id: "2-500", name: "500g", price: 26.99 },
    ],
    featured: true,
  },
  {
    id: "3",
    name: "Paletas Arcoíris",
    description: "Paletas multicolor con capas de diferentes sabores frutales. Diversión garantizada.",
    image: "https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=400&h=400&fit=crop",
    category: "lollipops",
    variants: [
      { id: "3-3", name: "Pack 3", price: 2.99 },
      { id: "3-6", name: "Pack 6", price: 4.99 },
      { id: "3-12", name: "Pack 12", price: 8.99 },
    ],
  },
  {
    id: "4",
    name: "Gusanos Ácidos",
    description: "Gusanos de goma cubiertos de azúcar ácida. El balance perfecto entre dulce y ácido.",
    image: "https://images.unsplash.com/photo-1596095627460-0f9f47b0e8e8?w=400&h=400&fit=crop",
    category: "sour",
    variants: [
      { id: "4-100", name: "100g", price: 4.49 },
      { id: "4-250", name: "250g", price: 9.99 },
      { id: "4-500", name: "500g", price: 17.99 },
    ],
    featured: true,
  },
  {
    id: "5",
    name: "Regaliz Premium",
    description: "Regaliz negro tradicional importado de Finlandia. Sabor intenso y auténtico.",
    image: "https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400&h=400&fit=crop",
    category: "licorice",
    variants: [
      { id: "5-100", name: "100g", price: 5.49 },
      { id: "5-250", name: "250g", price: 11.99 },
      { id: "5-500", name: "500g", price: 21.99 },
    ],
  },
  {
    id: "6",
    name: "Malvaviscos Artesanales",
    description: "Esponjosos malvaviscos hechos a mano con vainilla de Madagascar.",
    image: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400&h=400&fit=crop",
    category: "marshmallows",
    variants: [
      { id: "6-100", name: "100g", price: 4.99 },
      { id: "6-250", name: "250g", price: 10.99 },
      { id: "6-500", name: "500g", price: 19.99 },
    ],
  },
  {
    id: "7",
    name: "Caramelos de Miel",
    description: "Caramelos artesanales elaborados con miel pura de abeja. Sin colorantes artificiales.",
    image: "https://images.unsplash.com/photo-1499195333224-3ce974eecb47?w=400&h=400&fit=crop",
    category: "caramels",
    variants: [
      { id: "7-100", name: "100g", price: 3.99 },
      { id: "7-250", name: "250g", price: 8.49 },
      { id: "7-500", name: "500g", price: 14.99 },
    ],
    featured: true,
  },
  {
    id: "8",
    name: "Jelly Beans Gourmet",
    description: "50 sabores únicos en cada paquete. Desde frutas tropicales hasta postres clásicos.",
    image: "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400&h=400&fit=crop",
    category: "jellybeans",
    variants: [
      { id: "8-100", name: "100g", price: 5.99 },
      { id: "8-250", name: "250g", price: 12.99 },
      { id: "8-500", name: "500g", price: 23.99 },
    ],
  },
  {
    id: "9",
    name: "Corazones de Fresa",
    description: "Gomitas en forma de corazón con intenso sabor a fresa natural.",
    image: "https://images.unsplash.com/photo-1562147458-0c12e8d29f50?w=400&h=400&fit=crop",
    category: "gummies",
    variants: [
      { id: "9-100", name: "100g", price: 4.29 },
      { id: "9-250", name: "250g", price: 9.49 },
      { id: "9-500", name: "500g", price: 16.99 },
    ],
  },
  {
    id: "10",
    name: "Trufas de Chocolate Negro",
    description: "Exquisitas trufas de chocolate negro 70% cacao con centro cremoso.",
    image: "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400&h=400&fit=crop",
    category: "chocolates",
    variants: [
      { id: "10-6", name: "Pack 6", price: 9.99 },
      { id: "10-12", name: "Pack 12", price: 17.99 },
      { id: "10-24", name: "Pack 24", price: 32.99 },
    ],
  },
  {
    id: "11",
    name: "Cintas Ácidas Arcoíris",
    description: "Largas cintas de caramelo con azúcar ácida en múltiples sabores.",
    image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop",
    category: "sour",
    variants: [
      { id: "11-100", name: "100g", price: 3.99 },
      { id: "11-250", name: "250g", price: 8.99 },
      { id: "11-500", name: "500g", price: 15.99 },
    ],
  },
  {
    id: "12",
    name: "Bombones de Licor",
    description: "Bombones de chocolate con relleno de licores premium: brandy, cointreau y amaretto.",
    image: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=400&fit=crop",
    category: "chocolates",
    variants: [
      { id: "12-6", name: "Pack 6", price: 12.99 },
      { id: "12-12", name: "Pack 12", price: 22.99 },
      { id: "12-24", name: "Pack 24", price: 42.99 },
    ],
  },
];

export const heroSlides = [
  {
    id: 1,
    title: "Dulzura Premium",
    subtitle: "Las mejores golosinas del mundo",
    discount: "20% OFF",
    image: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=800&h=400&fit=crop",
    bgColor: "from-pink-400 to-rose-500",
  },
  {
    id: 2,
    title: "Chocolates Belgas",
    subtitle: "Importación directa",
    discount: "Nuevos",
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&h=400&fit=crop",
    bgColor: "from-amber-600 to-orange-500",
  },
  {
    id: 3,
    title: "Pack Fiesta",
    subtitle: "Surtido para eventos",
    discount: "3x2",
    image: "https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=800&h=400&fit=crop",
    bgColor: "from-purple-400 to-pink-500",
  },
];
