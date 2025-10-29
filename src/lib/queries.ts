// 🔎 Fetch all products
export const productsQuery = `*[_type == "product"]{
  _id,
  name,
  price,
  originalPrice,
  "imageUrl": image.asset->url,
  description,
  rating,
  discount,
  isNew,
  isTrending,
  isFlashSale,
  salesCount,
  category->{
    _id,
    name,
    "imageUrl": image.asset->url,
    "slugs": slugs[].current
  }
}`;

// 🔎 Fetch all categories
export const categoriesQuery = `*[_type == "category"]{
  _id,
  name,
  "imageUrl": image.asset->url,
  productCount,
  "slugs": slugs[].current
}`;

// 🔎 Fetch products by category slug (matches ANY slug in array)
export const productsByCategoryQuery = `*[_type == "product" && $slug in category->slugs[].current]{
  _id,
  name,
  price,
  originalPrice,
  description,
  "imageUrl": image.asset->url,
  "slug": slug.current,
  rating,
  discount,
  isNew,
  isTrending,
  isFlashSale,
  salesCount,
  category->{
    _id,
    name,
    "slugs": slugs[].current
  }
}`;

// ✅ FIXED 🔎 Fetch a single product detail by slug / name / _id
export const productDetailQuery = `
  *[_type == "product" && (
    slug.current == $slug || lower(name) == lower($slug) || _id == $slug
  )][0]{
    _id,
    name,
    price,
    originalPrice,
    "imageUrl": image.asset->url,
    description,
    rating,
    discount,
    isNew,
    isTrending,
    isFlashSale,
    salesCount,
    category->{
      _id,
      name,
      "slugs": slugs[].current
    }
  }
`;

// 🔎 Flash Sale Products
export const flashSaleQuery = `*[_type == "product" && isFlashSale == true]{
  _id,
  name,
  price,
  originalPrice,
  "imageUrl": image.asset->url,
  description,
  rating,
  discount,
  isNew,
  isTrending,
  isFlashSale,
  salesCount,
  category->{
    _id,
    name,
    "slugs": slugs[].current
  }
}`;

// 🔎 Best Sellers
export const bestSellersQuery = `*[_type == "product"] | order(salesCount desc)[0...8]{
  _id,
  name,
  price,
  originalPrice,
  "imageUrl": image.asset->url,
  description,
  rating,
  discount,
  isNew,
  isTrending,
  isFlashSale,
  salesCount,
  category->{
    _id,
    name,
    "slugs": slugs[].current
  }
}`;

// 🔎 Trending Products
export const trendingProductsQuery = `*[_type == "product" && isTrending == true]{
  _id,
  name,
  price,
  originalPrice,
  "imageUrl": image.asset->url,
  description,
  rating,
  discount,
  isNew,
  isTrending,
  isFlashSale,
  salesCount,
  category->{
    _id,
    name,
    "slugs": slugs[].current
  }
}`;
// 🔎 Live Search — Match product names OR category names
export const searchProductsQuery = `
  *[_type == "product" && (
    name match $query || 
    category->name match $query
  )]{
    _id,
    name,
    price,
    originalPrice,
    "imageUrl": image.asset->url,
    description,
    rating,
    discount,
    isNew,
    isTrending,
    isFlashSale,
    salesCount,
    category->{
      _id,
      name,
      "slugs": slugs[].current
    }
  }
`;


// 🔎 New Arrivals
export const newArrivalsQuery = `*[_type == "product" && isNew == true]{
  _id,
  name,
  price,
  originalPrice,
  "imageUrl": image.asset->url,
  description,
  rating,
  discount,
  isNew,
  isTrending,
  isFlashSale,
  salesCount,
  category->{
    _id,
    name,
    "slugs": slugs[].current
  }
    
}`;
