'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductGrid from '@/components/Home/ProductGrid';
import { Product } from '@/types';
import { client } from '@/lib/sanity';
import { productsByCategoryQuery } from '@/lib/queries';

export default function CategoryProductsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchProducts = async () => {
      try {
        const data = await client.fetch(productsByCategoryQuery, { slug });
        
        if (data && data.length > 0) {
          setCategoryName(data[0].category?.name || 'Category');
          
          const mapped: Product[] = data.map((p: any) => ({
            id: p._id,
            name: p.name,
            price: p.price,
            originalPrice: p.originalPrice,
            imageUrl: p.imageUrl,
            description: p.description,
            category: p.category,
            rating: p.rating,
            discount: p.discount,
            isNew: p.isNew,
            slug: p.slug?.current,
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch category products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug]);

  return (
    <div className="pt-20">
      {loading ? (
        <p className="text-center text-gray-500">Loading products...</p>
      ) : (
        <ProductGrid 
          title={categoryName} 
          products={products}
          showViewAll={false}
        />
      )}
    </div>
  );
}