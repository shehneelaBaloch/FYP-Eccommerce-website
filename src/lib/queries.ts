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
"slug": slug.current,   
  category->{
    _id,
    name,
    "imageUrl": image.asset->url,
    slug
  }
}`;

// 🔎 Fetch all categories
export const categoriesQuery = `*[_type == "category"]{
  _id,
  name,
  "imageUrl": image.asset->url,
  productCount,
  slug
}`;

// 🔎 Fetch products by category slug
export const productsByCategoryQuery = `*[_type == "product" && category->slug.current == $slug] {
  _id,
  name,
  price,
  originalPrice,
  description,
  "imageUrl": images[0].asset->url,
  "slug": slug.current,
  rating,
  discount,
  isNew,
  isTrending,
  category->{
    _id,
    name,
    "slug": slug.current
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
  slug,
  category->{
    _id,
    name,
    slug
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
  slug,
  category->{
    _id,
    name,
    slug
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
  slug,
  category->{
    _id,
    name,
    slug
  }
}`;
