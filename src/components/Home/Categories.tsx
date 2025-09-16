'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/types';
import { client } from '@/lib/sanity';
import { categoriesQuery } from '@/lib/queries';
import Link from 'next/link'; // ✅ Import Link

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await client.fetch(categoriesQuery);
        const mapped: Category[] = data.map((c: any) => ({
          id: c._id,
          name: c.name,
          imageUrl: c.imageUrl,
          productCount: c.productCount ?? 0,
          slug: c.slug?.current ?? '',
        }));
        setCategories(mapped);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our wide range of products across various categories
          </p>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading categories...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-32 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-16 h-16 object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">{category.productCount} products</p>
                  
                  {/* ✅ Wrap Explore button in Link */}
                  <Link href={`/categories/${category.slug}`}>
                    <motion.button
                      whileHover={{ x: 5 }}
                      className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center justify-center gap-1 w-full"
                    >
                      Explore
                      <ArrowRight size={14} />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;
