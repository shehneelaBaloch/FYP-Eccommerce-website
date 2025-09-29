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
    "slugs": slugs[].current   // ✅ multiple slugs support
  }
}`;

// 🔎 Fetch all categories
export const categoriesQuery = `*[_type == "category"]{
  _id,
  name,
  "imageUrl": image.asset->url,
  productCount,
  "slugs": slugs[].current    // ✅ flatten array of slugs
}`;

// 🔎 Fetch products by category slug (match ANY slug inside array)
export const productsByCategoryQuery = `*[_type == "product" && $slug in category->slugs[].current] {
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

// 🔎 Fetch a single product detail by slug
export const productDetailQuery = `*[_type == "product" && slug.current == $slug][0]{
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

// 🔎 Fetch only flash sale products
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

// 🔎 Fetch only best sellers (by salesCount)
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

// 🔎 Fetch only trending products
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

// 🔎 Fetch only new arrivals
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
