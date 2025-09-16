'use client';

import { useEffect, useState } from 'react';
import Hero from '@/components/Home/Hero';
import Features from '@/components/Home/Features';
import Categories from '@/components/Home/Categories';
import ProductGrid from '@/components/Home/ProductGrid';
import Newsletter from '@/components/Home/Newsletter';
import { Product } from '@/types';
import { client } from '@/lib/sanity';
import { productsQuery } from '@/lib/queries';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
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

        // ✅ New Arrivals = products with isNew flag
        const arrivals = mapped.filter((p) => p.isNew === true);

        setFeaturedProducts(featured);
        setNewArrivals(arrivals);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Hero />
      <Features />
      <Categories />

      {loading ? (
        <p className="text-center text-gray-500 py-10">Loading products...</p>
      ) : (
        <>
          <ProductGrid title="Featured Products" products={featuredProducts} />
          <ProductGrid title="New Arrivals" products={newArrivals} showViewAll={false} />
        </>
      )}

      <Newsletter />
    </>
  );
}
