export type Locale = "ar" | "en";

export interface LocalizedText {
  ar: string;
  en: string;
}

export type Gender = "men" | "women" | "unisex";

export interface ProductSize {
  ml: number;
  price: number;
  compareAtPrice?: number;
  sku: string;
}

export interface ProductNotes {
  top: LocalizedText[];
  heart: LocalizedText[];
  base: LocalizedText[];
}

export interface Review {
  id: string;
  productId: string;
  name: LocalizedText;
  rating: number;
  date: string;
  comment: LocalizedText;
  verified?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: LocalizedText;
  tagline: LocalizedText;
  description: LocalizedText;
  gender: Gender;
  concentration: LocalizedText;
  images: string[];
  sizes: ProductSize[];
  notes: ProductNotes;
  tags: ("bestseller" | "new" | "offer" | "national-day" | "limited")[];
  collection?: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

export interface Collection {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  image: string;
}

export interface CampaignConfig {
  enabled: boolean;
  slug: string;
  image: string;
  mobileImage: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  discountPercent: number;
  promoCode: string;
  endsAt: string;
  productIds: string[];
  theme: {
    primary: string;
    accent: string;
  };
}

export interface FaqItem {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
}

export interface CartLine {
  productId: string;
  slug: string;
  name: LocalizedText;
  image: string;
  ml: number;
  sku: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
}
