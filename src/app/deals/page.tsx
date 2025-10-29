'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, CheckCircle2, Loader2, Zap, X, Clock, Star, TrendingUp, Heart } from 'lucide-react';
import { client } from '@/lib/sanity';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  description: string;
  imageUrl: string;
  category?: {
    name: string;
    slugs?: string[];
  };
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

interface ToggleResponse {
  success: boolean;
  removed?: boolean;
  error?: string;
  message?: string;
}

// ✅ Optimized query to fetch ONLY discounted products
const discountedProductsQuery = `*[_type == "product" && defined(discount) && discount > 0]{
  _id,
  name,
  price,
  discount,
  description,
  "imageUrl": image.asset->url,
  category->{name}
}`;

export default function DealsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [added, setAdded] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [wishlist, setWishlist] = useState<string[]>([]);

  // ✅ Memoized price calculation
  const calculateDiscountedPrice = useCallback((product: Product) => {
    const basePrice = product.price || 0;
    const discountPercentage = product.discount || 0;
    
    if (discountPercentage > 0) {
      const discountedPrice = basePrice * (1 - discountPercentage / 100);
      return {
        originalPrice: basePrice,
        discountedPrice: Math.round(discountedPrice * 100) / 100,
        savings: basePrice - discountedPrice,
        discountPercentage
      };
    }
    
    return {
      originalPrice: basePrice,
      discountedPrice: basePrice,
      savings: 0,
      discountPercentage: 0
    };
  }, []);

  // ✅ OPTIMIZED: Fetch ONLY discounted products directly from Sanity
  useEffect(() => {
    let mounted = true;

    async function fetchDeals() {
      try {
        setLoading(true);
        // Fetch only discounted products in one query
        const discountedProducts = await client.fetch(discountedProductsQuery);
        
        if (mounted) {
          setProducts(discountedProducts || []);
        }
      } catch (err) {
        console.error('Error fetching deals:', err);
        if (mounted) {
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchDeals();

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ OPTIMIZED: Fetch wishlist only when user is authenticated
  useEffect(() => {
    let mounted = true;

    async function fetchWishlist() {
      if (!userId || !mounted) return;
      
      try {
        const res = await fetch(`/api/wishlist/list?userId=${userId}`);
        if (!mounted) return;
        
        const data = await res.json();
        
        if (Array.isArray(data) && mounted) {
          const productIds = data.map((item: any) => item.productId?._id || item.productId);
          setWishlist(productIds.filter((id: string) => id));
        }
      } catch (err) {
        console.error('Error fetching wishlist:', err);
      }
    }
    
    if (session && userId) {
      fetchWishlist();
    }

    return () => {
      mounted = false;
    };
  }, [session, userId]);

  // ✅ OPTIMIZED: Memoized product transformations
  const enhancedProducts = useMemo(() => 
    products.map(product => {
      const pricing = calculateDiscountedPrice(product);
      return {
        ...product,
        ...pricing,
        savingsPercentage: pricing.discountPercentage
      };
    }).sort((a, b) => b.savingsPercentage - a.savingsPercentage)
  , [products, calculateDiscountedPrice]);

  // ✅ OPTIMIZED: Memoized categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category?.name || 'Uncategorized')));
    return ['all', ...uniqueCategories];
  }, [products]);

  // ✅ OPTIMIZED: Memoized filtered products
  const filteredProducts = useMemo(() => 
    activeCategory === 'all' 
      ? enhancedProducts 
      : enhancedProducts.filter(product => product.category?.name === activeCategory)
  , [activeCategory, enhancedProducts]);

  // ✅ OPTIMIZED: Memoized statistics
  const dealStats = useMemo(() => {
    if (enhancedProducts.length === 0) {
      return { maxDiscount: 0, maxSavings: 0 };
    }
    
    return {
      maxDiscount: Math.max(...enhancedProducts.map(p => p.discountPercentage)),
      maxSavings: Math.max(...enhancedProducts.map(p => p.savings))
    };
  }, [enhancedProducts]);

  // ✅ OPTIMIZED: Debounced toast
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, []);

  // ✅ OPTIMIZED: Add to Cart with better error handling
  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (!userId) {
      showToast('❌ User ID missing!', 'error');
      return;
    }

    try {
      setAdded(productId);
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity }),
      });

      const data = await res.json();

      if (data.success) {
        showToast('✅ Added to cart!', 'success');
        setTimeout(() => setAdded(null), 1500);
      } else {
        showToast('❌ Failed: ' + (data.error || 'Unknown error'), 'error');
        setAdded(null);
      }
    } catch (err) {
      console.error('Add to cart failed:', err);
      showToast('❌ Add to cart failed!', 'error');
      setAdded(null);
    }
  }, [session, userId, router, showToast]);

  // ✅ OPTIMIZED: Wishlist with optimistic updates
  const toggleWishlist = useCallback(async (productId: string) => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (!userId) {
      showToast('❌ User ID missing!', 'error');
      return;
    }

    try {
      const isCurrentlyInWishlist = wishlist.includes(productId);
      
      // Optimistic update
      setWishlist(prev => 
        isCurrentlyInWishlist 
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );

      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId }),
      });

      const data: ToggleResponse = await res.json();

      if (!data.success) {
        // Revert optimistic update on failure
        setWishlist(prev => 
          isCurrentlyInWishlist 
            ? [...prev, productId]
            : prev.filter(id => id !== productId)
        );
        showToast('❌ Failed: ' + (data.error || 'Unknown error'), 'error');
      } else {
        showToast(data.removed ? '❤️ Removed from wishlist!' : '❤️ Added to wishlist!', 'success');
      }
    } catch (err) {
      console.error('Wishlist toggle failed:', err);
      showToast('❌ Wishlist update failed!', 'error');
    }
  }, [session, userId, router, wishlist, showToast]);

  // ✅ OPTIMIZED: Quick buy handler
  const handleQuickBuy = useCallback(async (productId: string) => {
    await addToCart(productId);
    router.push('/cart');
  }, [addToCart, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading hot deals...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        No discounted products found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative">
      {/* Enhanced Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full mb-4"
        >
          <TrendingUp size={18} className="text-purple-600" />
          <span className="text-sm font-medium text-purple-700">Limited Time Offers</span>
        </motion.div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Flash Deals & Discounts
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Don't miss out on these exclusive offers! Limited quantities available.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === category
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category === 'all' ? 'All Deals' : category}
          </button>
        ))}
      </div>

      {/* Deal Statistics - Compact */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl text-center">
          <div className="text-lg font-bold text-purple-600">{filteredProducts.length}</div>
          <div className="text-xs text-gray-600">Active Deals</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl text-center">
          <div className="text-lg font-bold text-green-600">
            {dealStats.maxDiscount}%
          </div>
          <div className="text-xs text-gray-600">Max Save</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl text-center">
          <div className="text-lg font-bold text-blue-600">
            ${dealStats.maxSavings.toFixed(0)}
          </div>
          <div className="text-xs text-gray-600">Biggest Save</div>
        </div>
      </div>

      {/* Compact Products Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12"
        >
          {filteredProducts.map((product: any) => (
            <motion.div
              key={product._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
            >
              {/* Discount Badge */}
              <div className="absolute top-3 left-3 z-10">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-md shadow-lg">
                  <div className="text-xs font-bold">-{product.discountPercentage}%</div>
                </div>
              </div>

              {/* Wishlist Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleWishlist(product._id)}
                className={`absolute top-3 right-3 z-10 p-1.5 rounded-full transition-all ${
                  wishlist.includes(product._id)
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500 backdrop-blur-sm'
                }`}
              >
                <Heart 
                  size={16} 
                  className={wishlist.includes(product._id) ? 'fill-current' : ''}
                />
              </motion.button>

              {/* Hot Deal Ribbon */}
              {product.discountPercentage > 30 && (
                <div className="absolute top-12 right-3 z-10 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold rotate-12 shadow-lg">
                  HOT
                </div>
              )}

              {/* Compact Image */}
              <Link href={`/product/${product._id}`} className="relative w-full h-40 block overflow-hidden">
                <Image
                  src={product.imageUrl || '/placeholder.png'}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  priority={false} // Don't prioritize all images
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              </Link>

              {/* Compact Product Info */}
              <div className="p-3 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1 text-sm group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-tight">
                    {product.description}
                  </p>
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-gray-900">
                      ${product.discountedPrice.toFixed(2)}
                    </span>
                    {product.discountPercentage > 0 && (
                      <span className="text-sm text-gray-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  {product.savings > 0 && (
                    <div className="text-xs text-green-600 font-medium">
                      Save ${product.savings.toFixed(2)}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={added === product._id}
                    onClick={() => addToCart(product._id)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      added === product._id
                        ? 'bg-green-500 text-white'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {added === product._id ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <ShoppingCart size={16} />
                    )}
                    <span className="hidden xs:inline">
                      {added === product._id ? 'Added' : 'Add'}
                    </span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickBuy(product._id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium transition-all bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
                  >
                    <Zap size={16} />
                    <span className="hidden xs:inline">Buy</span>
                  </motion.button>
                </div>          
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* No Results State */}
      {filteredProducts.length === 0 && activeCategory !== 'all' && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-3">No deals found in this category</div>
          <button
            onClick={() => setActiveCategory('all')}
            className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            View All Deals
          </button>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 text-sm ${
              toast.type === 'success' 
                ? 'bg-green-500' 
                : 'bg-red-500'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 size={16} />
            ) : (
              <X size={16} />
            )}
            <span>{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}