'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ShoppingCart,
  CheckCircle2,
  Loader2,
  Zap,
  X,
  SlidersHorizontal,
  Star,
  Clock,
  TrendingUp,
  Sparkles,
  Filter,
  SortAsc,
} from 'lucide-react';
import { client } from '@/lib/sanity';
import { newArrivalsQuery, categoriesQuery } from '@/lib/queries';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function NewArrivalsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [added, setAdded] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Fetch new arrivals and categories
  useEffect(() => {
    async function fetchData() {
      try {
        const [newArrivals, allCategories] = await Promise.all([
          client.fetch(newArrivalsQuery),
          client.fetch(categoriesQuery),
        ]);
        setProducts(newArrivals);
        setCategories(allCategories);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ✅ Add to Cart logic
  const addToCart = async (productId: string, quantity = 1) => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (!userId) {
      setToast({ message: '❌ User ID missing!', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity }),
      });

      const data = await res.json();

      if (data.success) {
        setToast({ message: '✅ Added to cart!', type: 'success' });
        setAdded(productId);
        setTimeout(() => setAdded(null), 1500);
      } else {
        setToast({
          message: '❌ Failed: ' + (data.error || 'Unknown error'),
          type: 'error',
        });
      }

      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Add to cart failed:', err);
      setToast({ message: '❌ Add to cart failed!', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  // ✅ Apply category filter
  const filteredProducts = products.filter((p) =>
    selectedCategory === 'All' ? true : p.category?.name === selectedCategory
  );

  // ✅ Apply sort order
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'lowToHigh') return a.price - b.price;
    if (sortOrder === 'highToLow') return b.price - a.price;
    if (sortOrder === 'newest') return new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime();
    return 0;
  });

  // ✅ Group by category (for grouped view)
  const grouped = sortedProducts.reduce((acc: any, p: any) => {
    const cat = p.category?.name || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});
  const groupedCategories = Object.keys(grouped);

  // ✅ Loading state with enhanced UI
  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="text-white" size={24} />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading New Arrivals</h3>
          <p className="text-gray-500">Discovering the latest trends for you...</p>
        </motion.div>
      </div>
    );

  // ✅ Empty state with enhanced UI
  if (sortedProducts.length === 0)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-gray-300 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="text-gray-500" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No New Arrivals Yet</h3>
          <p className="text-gray-500 mb-6">Check back soon for fresh products and exclusive deals!</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <ArrowRight size={18} />
            Browse All Products
          </Link>
        </motion.div>
      </div>
    );

  // ✅ Enhanced Page UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles size={16} />
            Just Launched
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            New Arrivals
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Be the first to explore our latest collection. Fresh styles, exclusive deals, and limited-time offers await!
          </p>
        </motion.div>

        {/* Enhanced Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Filter Toggle for Mobile */}
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
                >
                  <Filter size={18} />
                  Filters
                </button>
                
                <div className="hidden lg:flex items-center gap-2">
                  <SlidersHorizontal className="text-blue-600" size={20} />
                  <span className="font-semibold text-gray-700">Filter & Sort</span>
                </div>
              </div>

              {/* Filters */}
              <div className={`flex flex-col lg:flex-row items-stretch lg:items-center gap-4 w-full lg:w-auto ${showFilters ? 'flex' : 'hidden lg:flex'}`}>
                {/* Category Filter */}
                <div className="flex-1 lg:flex-initial">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full lg:w-48 border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="flex-1 lg:flex-initial">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full lg:w-48 border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="lowToHigh">Price: Low to High</option>
                    <option value="highToLow">Price: High to Low</option>
                  </select>
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-center lg:justify-end">
                  <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium">
                    {sortedProducts.length} {sortedProducts.length === 1 ? 'Product' : 'Products'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 🛍️ Enhanced Product Grid */}
        <div className="space-y-16">
          {groupedCategories.map((categoryName, categoryIndex) => {
            const items = grouped[categoryName];
            return (
              <motion.section
                key={categoryName}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 + 0.2 }}
                className="relative"
              >
                {/* Enhanced Category Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="text-white" size={24} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800">{categoryName}</h2>
                      <p className="text-gray-500">{items.length} new products</p>
                    </div>
                  </div>
                  
                  <Link
                    href={`/categories/${items[0]?.category?.slugs?.[0] || '#'}`}
                    className="group flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl border border-gray-200/50 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 font-semibold text-gray-700 hover:text-blue-600"
                  >
                    View All
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Enhanced Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {items.map((product: any, productIndex: number) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (categoryIndex * 0.05) + (productIndex * 0.1) }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="group bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-200/50 hover:border-blue-200/50 flex flex-col"
                    >
                      {/* Image Container */}
                      <Link href={`/product/${product._id}`} className="relative w-full h-64 overflow-hidden">
                        <Image
                          src={product.imageUrl || '/placeholder.png'}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.isNew && (
                            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                              NEW
                            </span>
                          )}
                          {product.isFeatured && (
                            <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                              FEATURED
                            </span>
                          )}
                        </div>

                        {/* Overlay on Hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </Link>

                      {/* Product Info */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Title and Price */}
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 flex-1 mr-4">
                              {product.name}
                            </h3>
                            <div className="text-right">
                              <span className="text-blue-600 font-bold text-xl">
                                ${product.price}
                              </span>
                              {product.originalPrice && (
                                <span className="text-gray-400 line-through text-sm block">
                                  ${product.originalPrice}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                            {product.description}
                          </p>

                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={14}
                                  className={star <= 4 ? "text-yellow-400 fill-current" : "text-gray-300"}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">(4.2)</span>
                          </div>
                        </div>

                        {/* Enhanced Action Buttons */}
                        <div className="flex gap-3">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            disabled={added === product._id}
                            onClick={() => addToCart(product._id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300 ${
                              added === product._id
                                ? 'bg-green-500 text-white shadow-lg'
                                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg'
                            }`}
                          >
                            {added === product._id ? (
                              <>
                                <CheckCircle2 size={18} />
                                Added
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={18} />
                                Add to Cart
                              </>
                            )}
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={async () => {
                              await addToCart(product._id);
                              router.push('/cart');
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <Zap size={18} />
                            Buy Now
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Can't Find What You're Looking For?</h3>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Explore our complete collection with thousands of products across all categories.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors duration-300 shadow-2xl"
            >
              <TrendingUp size={20} />
              Browse All Products
              <ArrowRight size={20} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl font-medium flex items-center gap-3 z-50 ${
              toast.type === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <CheckCircle2 size={20} className="text-white" />
              ) : (
                <X size={20} className="text-white" />
              )}
              <span>{toast.message}</span>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}