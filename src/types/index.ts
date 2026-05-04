export type Category =
  | "Fries" | "Burgers" | "Pizza" | "Sandwiches" | "Frankies"
  | "Chicken Snacks" | "Egg Specials" | "Snacks" | "Maggie" | "Pasta" | "Soft Drinks";

export const CATEGORIES: Category[] = [
  "Fries", "Burgers", "Pizza", "Sandwiches", "Frankies",
  "Chicken Snacks", "Egg Specials", "Snacks", "Maggie", "Pasta", "Soft Drinks",
];

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  is_veg: boolean;
  image_url: string | null;
  stock: number;
  bestseller: boolean;
  is_active: boolean;
  size: string | null;
}

export interface CartItem {
  product: Product;
  qty: number;
}
