'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, User, Menu, X, Search, ChevronDown, Heart } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/hooks/useCart'; // ✅ DB cart hook

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const userId = session?.user?.id;
  const { cart, fetchCart } = useCart(userId);

  // Fetch cart whenever user logs in
  useEffect(() => {
    if (userId) fetchCart();
  }, [userId, fetchCart]);

  // ✅ FIXED: Safe cart count calculation with null checks
  const cartCount = Array.isArray(cart) 
    ? cart.reduce((acc, item) => acc + (item.quantity || 1), 0)
    : 0;

  const categories = [
    { name: 'Electronics', href: '/categories/electronics' },
    { name: 'Clothing', href: '/categories/clothing' },
    { name: 'Home & Garden', href: '/categories/home-garden' },
    { name: 'Sports', href: '/categories/sports' },
    { name: 'Books', href: '/categories/books' },
  ];

  const navigationItems = [
    { name: 'Deals', href: '/deals' },
    { name: 'New Arrivals', href: '/new-arrivals' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    signOut({ callbackUrl: '/' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          {/* Left Section: Logo + Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer"
              >
                ShopEase
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Categories Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ y: -2 }}
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="flex items-center space-x-1 px-3 py-2 font-medium text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <span>Categories</span>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`}
                  />
                </motion.button>

                {/* Categories Dropdown Menu */}
                {isCategoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        onClick={() => setIsCategoriesOpen(false)}
                      >
                        <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                          {category.name}
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Deals & New Arrivals */}
              {navigationItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={`relative px-3 py-2 font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-purple-600'
                        : 'text-gray-700 hover:text-purple-600'
                    }`}
                  >
                    {item.name}
                    {isActive(item.href) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600"
                        initial={false}
                      />
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Center Section: Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 w-full">
                <Search size={18} className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="bg-transparent outline-none text-sm w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          {/* Right Section: Action Buttons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Link href="/wishlist">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden lg:flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors relative"
              >
                <Heart size={20} />
                <span className="text-sm font-medium">Wishlist</span>
              </motion.button>
            </Link>

            {/* Profile */}
            {session ? (
              <Link href="/profile">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden lg:flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <User size={20} />
                  <span className="text-sm font-medium">Profile</span>
                </motion.button>
              </Link>
            ) : (
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden lg:flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <User size={20} />
                  <span className="text-sm font-medium">Sign In</span>
                </motion.button>
              </Link>
            )}

            {/* Cart Button */}
            <Link href="/cart">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white text-purple-600 border border-purple-600 px-4 py-2 rounded-full hover:bg-purple-50 transition-colors relative"
              >
                <ShoppingCart size={18} />
                <span className="text-sm font-medium">Cart</span>

                {/* ✅ FIXED: Badge with safe cart count */}
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t"
            onClick={() => setIsCategoriesOpen(false)}
          >
            <div className="py-4 space-y-2">
              {/* Mobile Categories */}
              <div className="px-4">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 text-lg font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <span>Categories</span>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Mobile Categories Dropdown */}
                {isCategoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="ml-4 mt-2 space-y-1 border-l-2 border-purple-200 pl-4"
                  >
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="block px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                          {category.name}
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Mobile Deals & New Arrivals */}
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div
                    className={`block px-4 py-3 text-lg font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                    } rounded-lg mx-2`}
                  >
                    {item.name}
                  </div>
                </Link>
              ))}

              {/* Mobile Search */}
              <div className="px-4 py-3">
                <form onSubmit={handleSearch}>
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
                    <Search size={18} className="text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="bg-transparent outline-none text-sm flex-1"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>
              </div>

              {/* Mobile Wishlist */}
              <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex items-center space-x-3 px-4 py-3 text-lg font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg mx-2 transition-colors">
                  <Heart size={20} />
                  <span>Wishlist</span>
                </div>
              </Link>

              {/* Mobile Auth + Cart */}
              <div className="px-4 py-3 space-y-2">
                {session ? (
                  <>
                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full bg-purple-600 text-white py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors">
                        Profile
                      </button>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full border border-gray-400 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full bg-purple-600 text-white py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors">
                      Sign In
                    </button>
                  </Link>
                )}

                <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full border border-purple-600 text-purple-600 py-3 rounded-full font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
                    <ShoppingCart size={18} />
                    {/* ✅ FIXED: Safe cart count in mobile menu */}
                    <span>Cart ({cartCount})</span>
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {isCategoriesOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsCategoriesOpen(false)}
        />
      )}
    </motion.nav>
  );
};

export default Navbar;