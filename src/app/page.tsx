'use client';

import { useEffect, useState } from 'react';
import Hero from '@/components/Home/Hero';
import Categories from '@/components/Home/Categories';
import ProductGrid from '@/components/Home/ProductGrid';
import Newsletter from '@/components/Home/Newsletter';
import { Product } from '@/types';
import { client } from '@/lib/sanity';
import {
  productsQuery,
  flashSaleQuery,
  bestSellersQuery,
  trendingProductsQuery,
  newArrivalsQuery,
} from '@/lib/queries';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [flashSale, setFlashSale] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [justForYou, setJustForYou] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // ✅ All products
        const data = await client.fetch(productsQuery);
        const mapped: Product[] = data.map((p: any) => ({
          id: p._id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice,
          imageUrl: p.imageUrl,
          description: p.description,
          rating: p.rating,
          discount: p.discount,
          isNew: p.isNew,
          isTrending: p.isTrending,
          category: p.category?.name,
        }));

        // Featured = top 4 products by rating
        const featured = mapped
          .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
          .slice(0, 4);
        setFeaturedProducts(featured);

        // ✅ New Arrivals = products with isNew flag
        const arrivals = mapped.filter((p) => p.isNew === true);
        setNewArrivals(arrivals);

        // ⚡ Flash Sale
        const flash = await client.fetch(flashSaleQuery);
        setFlashSale(flash);

        // 🏆 Best Sellers
        const best = await client.fetch(bestSellersQuery);
        setBestSellers(best);

        // 🔥 Trending
        const trendingData = await client.fetch(trendingProductsQuery);
        setTrending(trendingData);

        // 🎯 Just For You = random shuffle from all products
        const random = [...mapped].sort(() => 0.5 - Math.random()).slice(0, 8);
        setJustForYou(random);
      } catch (err) {
        console.error('❌ Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Hero />
      <Categories />

      {loading ? (
        <p className="text-center text-gray-500 py-10">Loading products...</p>
      ) : (
        <>
          {/* Existing Sections */}
          <ProductGrid title="Featured Products" products={featuredProducts} />
          <ProductGrid title="New Arrivals" products={newArrivals} showViewAll={false} />

          {/* New Sections */}
          {flashSale.length > 0 && (
            <ProductGrid title="⚡ Flash Sale" products={flashSale} showViewAll />
          )}
          {bestSellers.length > 0 && (
            <ProductGrid title="🏆 Best Sellers" products={bestSellers} showViewAll />
          )}
          {trending.length > 0 && (
            <ProductGrid title="🔥 Trending Now" products={trending} showViewAll />
          )}
          {justForYou.length > 0 && (
            <ProductGrid title="🎯 Just For You" products={justForYou} showViewAll />
          )}
        </>
      )}

      <Newsletter />
    </>
  );
}
