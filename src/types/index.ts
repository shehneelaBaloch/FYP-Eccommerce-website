export interface Product {
  id: string; // comes from Sanity's _id
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string; // safer since Sanity image is optional
  description?: string;
  category?: string; // also optional unless always defined
  rating?: number;
  discount?: number;
  isNew?: boolean;
  isTrending?: boolean;

    slug?: string;
}

export interface Category {
  id: string; // should be string if coming from Sanity
  name: string;
  imageUrl?: string;
  productCount?: number;
  slug: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface FeaturedProduct {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  ctaText: string;
  ctaLink: string;
}
