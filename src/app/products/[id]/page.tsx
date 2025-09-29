"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { client } from "@/lib/sanity";
import { productDetailQuery } from "@/lib/queries";
import { Product } from "@/types";
import {
  Truck,
  Shield,
  RotateCcw,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { useCart } from "@/hooks/useCart"; // ✅ DB cart hook
import { useWishlist } from "@/hooks/useWishlist"; // ✅ DB wishlist hook
import { useSession } from "next-auth/react";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.id as string | undefined; // route param

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const { data: session } = useSession();
  const router = useRouter();

  // ✅ Login guard
  const requireLogin = (callback: () => void) => {
    if (!session) {
      router.push("/login");
    } else {
      callback();
    }
  };

  const handleAddToCart = () => {
    requireLogin(() => {
      if (product) {
        addToCart(product._id); // ✅ use _id
      }
    });
  };

  const handleToggleWishlist = () => {
    requireLogin(() => {
      if (product) {
        toggleWishlist(product._id); // ✅ use _id
      }
    });
  };

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        const data = await client.fetch(productDetailQuery, { slug });
        if (data) {
          setProduct({
            _id: data._id, // ✅ keep as _id, not remap to id
            slug: data.slug?.current ?? "",
            name: data.name,
            price: data.price,
            originalPrice: data.originalPrice,
            imageUrl: data.imageUrl,
            description: data.description,
            category: data.category,
            rating: data.rating,
            discount: data.discount,
            isNew: data.isNew,
            isTrending: data.isTrending,
          });
        }
      } catch (err) {
        console.error("❌ Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <p className="text-center text-gray-500 py-10">
        Loading product...
      </p>
    );
  }

  if (!product) {
    return (
      <p className="text-center text-red-500 py-10">
        Product not found.
      </p>
    );
  }

  const isWishlisted = wishlist.some((w) => w.productId === product._id);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8">
          Home / Products / {product.category ?? "General"} / {product.name}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="object-contain h-full w-full rounded-xl"
                />
              ) : (
                <span className="text-gray-400 text-lg">Product Image</span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex gap-2">
              {product.isNew && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  New Arrival
                </span>
              )}
              {product.discount && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>

            {/* Rating */}
            {product.rating !== undefined && (
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {"★".repeat(Math.floor(product.rating))}
                  {"☆".repeat(5 - Math.floor(product.rating))}
                </div>
                <span className="text-gray-600">({product.rating})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-gray-900">
                ${product.price != null ? product.price.toFixed(2) : "0.00"}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 text-lg leading-relaxed">
              {product.description}
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Truck className="mx-auto mb-2 text-purple-600" size={24} />
                <p className="text-sm text-gray-600">Free Shipping</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Shield className="mx-auto mb-2 text-purple-600" size={24} />
                <p className="text-sm text-gray-600">2-Year Warranty</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <RotateCcw className="mx-auto mb-2 text-purple-600" size={24} />
                <p className="text-sm text-gray-600">30-Day Returns</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Add to Cart - ${product.price?.toFixed(2)}
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`w-full border-2 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  isWishlisted
                    ? "border-red-500 text-red-500 hover:bg-red-50"
                    : "border-purple-600 text-purple-600 hover:bg-purple-50"
                }`}
              >
                <Heart size={20} />
                {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
