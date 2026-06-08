// app/api/wishlist/list/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Wishlist from "@/lib/model/Wishlist";
import { client } from "@/lib/sanity";

export const dynamic = "force-dynamic";
import { groq } from "next-sanity";

interface WishlistItem {
  _id: string;
  userId: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  slug: string;
  description?: string;
}

interface SanityProduct {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  slug: string;
  description?: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    if (!userId) return NextResponse.json([], { status: 200 });

    await connectDB();

    // Fetch wishlist items from MongoDB - remove .lean() to get proper Mongoose documents
    const wishlistItems = await Wishlist.find({ userId });

    if (!wishlistItems.length) return NextResponse.json([]);

    // Get all product IDs from wishlist
    const productIds = wishlistItems.map((i) => i.productId);

    // Fetch product details from Sanity
    const products: SanityProduct[] = await client.fetch(
      groq`*[_type == "product" && _id in $ids]{
        _id, name, price, "imageUrl": image.asset->url, slug, description
      }`,
      { ids: productIds }
    );

    // Convert to plain objects and merge wishlist + product info
    const merged = wishlistItems.map((item) => {
      const plainItem = item.toObject();
      return {
        ...plainItem,
        productId: products.find((p: SanityProduct) => p._id === plainItem.productId) || {} as SanityProduct,
      };
    });

    return NextResponse.json(merged);
  } catch (err: any) {
    console.error("❌ Wishlist List Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}