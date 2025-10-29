"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { client } from "@/lib/sanity";
import { productDetailQuery, productsQuery } from "@/lib/queries";
import { Product } from "@/types";
import { Truck, Shield, RotateCcw, ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = decodeURIComponent(params?.id as string);
  const [product, setProduct] = useState<Product | null>(null);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const { data: session } = useSession();
  const router = useRouter();

  const requireLogin = (callback: () => void) => {
    if (!session) router.push("/login");
    else callback();
  };

  const handleAddToCart = () => {
    requireLogin(() => {
      if (product) addToCart(product.id);
    });
  };

  const handleToggleWishlist = () => {
    requireLogin(() => {
      if (product) toggleWishlist(product.id);
    });
  };

  // 🧠 Fetch product + recommendations
  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        const data = await client.fetch(productDetailQuery, { slug });

        if (!data) {
          console.warn("⚠️ No product found for slug:", slug);
          setProduct(null);
          setRecommended([]);
          setLoading(false);
          return;
        }

        // ✅ Main product
        const safeRating =
          typeof data.rating === "number"
            ? Math.min(5, Math.max(0, data.rating))
            : 0;

        const productData: Product = {
          id: data._id,
          _id: data._id,
          slug: data.slug?.current ?? "",
          name: data.name,
          price: data.price,
          originalPrice: data.originalPrice,
          imageUrl: data.imageUrl,
          description: data.description,
          category: data.category?.name || "General",
          rating: safeRating,
          discount: data.discount,
          isNew: data.isNew,
          isTrending: data.isTrending,
        };
        setProduct(productData);

        // ✅ Recommended products (same category)
        const related = await client.fetch(productsQuery);
        const filtered = Array.isArray(related)
          ? related
              .filter(
                (p: any) =>
                  p &&
                  p._id &&
                  p._id !== data._id &&
                  p.category?.name === data.category?.name
              )
              .slice(0, 4)
          : [];

        setRecommended(filtered);
      } catch (err) {
        console.error("❌ Failed to fetch product:", err);
        setProduct(null);
        setRecommended([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading)
    return <p className="text-center text-gray-500 py-10">Loading product...</p>;

  if (!product)
    return <p className="text-center text-red-500 py-10">Product not found.</p>;

  const isWishlisted = wishlist.some((w) => w.productId === product.id);

  // 🧩 Safe rating handling
  const starsFilled = Math.floor(product.rating ?? 0);
  const starsEmpty = 5 - starsFilled;

  return (
    <div className="min-h-screen py-10 bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 🧭 Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/">Home</Link> / <Link href="/products">Products</Link> /{" "}
          {product.name}
        </nav>

        {/* 🏷️ Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start bg-white rounded-3xl shadow-lg p-6 md:p-10">
          {/* 📸 Image */}
          <div className="rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="object-contain max-h-[400px] w-auto"
              />
            ) : (
              <span className="text-gray-400 text-lg">No Image</span>
            )}
          </div>

          {/* 🧾 Info */}
          <div className="space-y-4">
            {/* Labels */}
            <div className="flex gap-2">
              {product.isNew && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  New Arrival
                </span>
              )}
              {product.discount && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {product.name}
            </h1>

            {/* ⭐ Rating */}
            {product.rating !== undefined && (
              <div className="flex items-center gap-2 text-yellow-500 text-sm">
                {"★".repeat(starsFilled)}
                {"☆".repeat(starsEmpty)}
                <span className="text-gray-600 ml-2 text-xs">
                  ({product.rating})
                </span>
              </div>
            )}

            {/* 💵 Price */}
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-gray-900">
                ${product.price?.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-gray-400 line-through text-lg">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
              {product.description}
            </p>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 text-center text-sm pt-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <Truck className="mx-auto mb-1 text-purple-600" size={18} />
                <p>Free Shipping</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <Shield className="mx-auto mb-1 text-purple-600" size={18} />
                <p>2-Year Warranty</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <RotateCcw className="mx-auto mb-1 text-purple-600" size={18} />
                <p>30-Day Returns</p>
              </div>
            </div>

            {/* Buttons */}
           {/* Buttons */}
<div className="space-y-3 pt-2">
  <button
    onClick={handleAddToCart}
    className="w-full bg-gradient-to-r from-blue-800 to-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg transition flex items-center justify-center gap-2"
  >
    <ShoppingCart size={18} /> Add to Cart - ${product.price?.toFixed(2)}
  </button>

  <button
    onClick={handleToggleWishlist}
    className={`w-full border-2 py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
      isWishlisted
        ? "border-red-500 text-red-500 hover:bg-red-50"
        : "border-blue-800 text-blue-800 hover:bg-blue-50"
    }`}
  >
    <Heart size={18} />
    {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
  </button>
</div>

          </div>
        </div>

        {/* 💡 Recommended Section */}
        {recommended.length > 0 && (
          <div className="mt-14">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Recommended for You
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommended.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  <Link
                    href={`/product/${encodeURIComponent(
                      typeof p.slug === "object" && p.slug?.current
                        ? p.slug.current
                        : typeof p.slug === "string" && p.slug
                        ? p.slug
                        : ""
                    )}`}
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-800 truncate">
                        {p.name}
                      </h3>
                      <p className="text-pink-600 font-bold text-sm">
                        ${p.price?.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
