'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface ProductGridProps {
  title: string;
  products: Product[];
  showViewAll?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ title, products, showViewAll = true }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleQuickView = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Quick view:', product.name);
  };

  const handleAddToWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Add to wishlist:', product.name);
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            <p className="text-lg text-gray-600">
              Discover our curated collection of amazing products
            </p>
          </div>

          {showViewAll && (
            <Link href="/products">
              <motion.button
                whileHover={{ x: 5 }}
                className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2"
              >
                View All
                <ArrowRight size={16} />
              </motion.button>
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id || product.slug || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="relative">
                {/* Product Image with Link */}
                <Link href={`/products/${product.slug}`} className="block">
                  <div className="relative h-48 bg-gray-100">
                    <div className="w-full h-full flex items-center justify-center">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="object-contain h-full"
                        />
                      ) : (
                        <span className="text-gray-400">Product Image</span>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3">
                      {product.discount && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          -{product.discount}%
                        </span>
                      )}
                      {product.isNew && (
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold ml-2">
                          New
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 mb-2"
                        onClick={(e) => handleAddToWishlist(e, product)}
                      >
                        <Heart size={16} />
                      </button>
                      <button
                        className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50"
                        onClick={(e) => handleQuickView(e, product)}
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>

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

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        ${product.price != null ? product.price.toFixed(2) : '0.00'}
                      </span>
                      {product.originalPrice != null && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => handleAddToCart(e, product)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
