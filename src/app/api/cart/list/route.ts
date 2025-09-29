import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Cart from "@/lib/model/Cart";
import { client } from "@/lib/sanity";
import { groq } from "next-sanity";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    await connectDB();

    // 1️⃣ Get cart items from Mongo
    const items = await Cart.find({ userId });

    if (!items.length) return NextResponse.json([]);

    // 2️⃣ Fetch product details from Sanity
    const productIds = items.map((i) => i.productId);
    const products = await client.fetch(
      groq`*[_type == "product" && _id in $ids]{
        _id, name, price, originalPrice,
        "imageUrl": image.asset->url,
        slug, description
      }`,
      { ids: productIds }
    );

    // 3️⃣ Merge cart + product
    const merged = items.map((item) => {
      const product = products.find((p: any) => p._id === item.productId);
      return {
        _id: item._id,
        userId: item.userId,
        quantity: item.quantity,
        product, // full product from Sanity
      };
    });

    return NextResponse.json(merged);
  } catch (err: any) {
    console.error("❌ Cart fetch error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
