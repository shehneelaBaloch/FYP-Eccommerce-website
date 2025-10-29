"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  ChevronDown,
  Heart,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/hooks/useCart";
import { client } from "@/lib/sanity";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { cart, fetchCart } = useCart(userId);

  useEffect(() => {
    if (userId) fetchCart();
  }, [pathname, userId, fetchCart]);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await client.fetch(`
        *[_type == "category"] | order(name asc) {
          name,
          "slug": coalesce(slugs[0].current, slug.current, lower(name))
        }
      `);
      setCategories(data);
    };
    fetchCategories();
  }, []);

  // 🔎 Live Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const fetchResults = async () => {
      const data = await client.fetch(
        `
        {
          "products": *[_type == "product" && name match $q + "*"]{
            _id,
            name,
            price,
            "imageUrl": image.asset->url,
            "slug": coalesce(slug.current, name)
          },
          "categories": *[_type == "category" && name match $q + "*"]{
            _id,
            name,
            "slug": coalesce(slugs[0].current, slug.current, lower(name))
          }
        }
      `,
        { q: searchQuery }
      );
      const combined = [
        ...data.categories.map((c: any) => ({ ...c, type: "category" })),
        ...data.products.map((p: any) => ({ ...p, type: "product" })),
      ];
      setSearchResults(combined);
      setShowSearchResults(true);
    };

    const delay = setTimeout(fetchResults, 400);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cartCount = Array.isArray(cart)
    ? cart.reduce((a, i) => a + (i.quantity || 1), 0)
    : 0;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => signOut({ callbackUrl: "/" });

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Shopie
          </Link>

          {/* Center Search */}
          <div ref={searchRef} className="relative flex-1 max-w-xl mx-6">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <Search size={18} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search products or categories..."
                className="bg-transparent outline-none text-sm w-full ml-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() =>
                  searchResults.length > 0 && setShowSearchResults(true)
                }
              />
            </div>

            {/* 🔥 Daraz-style search results */}
            {showSearchResults && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white shadow-xl rounded-xl border border-gray-200 z-50"
              >
                {searchResults.length > 0 ? (
                  <>
                    {/* Top Categories Strip */}
                    <div className="flex gap-3 px-4 py-3 border-b border-gray-100 overflow-x-auto scrollbar-none">
                      {searchResults
                        .filter((i) => i.type === "category")
                        .map((cat) => (
                          <Link
                            key={cat._id}
                            href={`/categories/${encodeURIComponent(cat.slug)}`}
                            onClick={() => setShowSearchResults(false)}
                            className="text-sm bg-gray-50 hover:bg-purple-100 text-purple-600 font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition"
                          >
                            {cat.name}
                          </Link>
                        ))}
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
                      {searchResults
                        .filter((i) => i.type === "product")
                        .map((item) => (
                          <Link
                            key={item._id}
                            href={`/product/${encodeURIComponent(item.slug)}`}
                            onClick={() => setShowSearchResults(false)}
                            className="border rounded-xl hover:shadow-md transition-all duration-300 bg-white overflow-hidden"
                          >
                            <div className="w-full h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
                              <img
                                src={item.imageUrl || "/placeholder.png"}
                                alt={item.name}
                                className="object-contain w-full h-full group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="p-3 text-center">
                              <h4 className="text-sm font-medium text-gray-800 truncate">
                                {item.name}
                              </h4>
                              {item.price && (
                                <p className="text-pink-600 font-semibold text-sm mt-1">
                                  ${item.price}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="text-center py-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                          setShowSearchResults(false);
                        }}
                        className="text-purple-600 hover:text-pink-600 text-sm font-medium"
                      >
                        View all results →
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-gray-500 py-6 text-sm">
                    No results found for “{searchQuery}”
                  </p>
                )}
              </motion.div>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center space-x-4">
            <Link href="/wishlist" className="hidden lg:flex text-gray-700 hover:text-purple-600">
              <Heart size={20} />
            </Link>
            {session ? (
              <>
                <Link href="/profile" className="hidden lg:flex text-gray-700 hover:text-purple-600">
                  <User size={20} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden lg:flex text-red-600 hover:text-red-700"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Link href="/login" className="hidden lg:flex text-gray-700 hover:text-purple-600">
                <User size={20} />
              </Link>
            )}
            <Link
              href="/cart"
              className="flex items-center bg-white border border-purple-600 text-purple-600 px-4 py-2 rounded-full hover:bg-purple-50 transition relative"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
