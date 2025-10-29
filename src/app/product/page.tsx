'use client';

import React, { useEffect, useState } from 'react';
import ProductGrid from '@/components/Home/ProductGrid';
import { Product } from '@/types';
import { client } from '@/lib/sanity';
import { productsQuery } from '@/lib/queries';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await client.fetch(productsQuery);
        // Map Sanity _id → id for your Product type
        const mapped: Product[] = data.map((p: any) => ({
          id: p._id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice,
          imageUrl: p.imageUrl,     // ✅ from GROQ projection
          description: p.description,
          category: p.category,
          rating: p.rating,
          discount: p.discount,
          isNew: p.isNew,
        }));
        setProducts(mapped);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="pt-20">
      {loading ? (
        <p className="text-center text-gray-500">Loading products...</p>
      ) : (
        <ProductGrid 
          title="All Products" 
          products={products}
          showViewAll={false}
        />
      )}
    </div>
  );
}
