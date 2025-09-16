'use client';

import React from 'react';
import { Product } from '@/types';

interface TrendingProductsProps {
  products: Product[];
}

const TrendingProducts: React.FC<TrendingProductsProps> = ({ products }) => {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-100" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Trending Products
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Product Image */}
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="object-contain h-full w-full"
                  />
                ) : (
                  <span className="text-gray-400">Product Image</span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>

                {/* Price */}
                <p className="text-gray-600 mb-2">
                  ${product.price != null ? product.price.toFixed(2) : '0.00'}
                </p>

                {/* Rating */}
                {product.rating !== undefined && (
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {'★'.repeat(Math.floor(product.rating))}
                      {'☆'.repeat(5 - Math.floor(product.rating))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      ({product.rating})
                    </span>
                  </div>
                )}

                {/* CTA */}
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg hover:opacity-90 transition-all">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
