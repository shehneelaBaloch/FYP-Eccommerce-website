import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Order from "@/lib/model/Order";
import { client } from "@/lib/sanity";
import { groq } from "next-sanity";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json([], { status: 200 });

    await connectDB();

    // Fetch all orders for the user
    const orders = await Order.find({ userId }).lean();

    if (!orders.length) return NextResponse.json([]);

    // Collect all product IDs
    const productIds = orders.flatMap((o) =>
      o.products.map((p: any) => p.productId)
    );

    // Fetch product details from Sanity
    const products = await client.fetch(
      groq`*[_type == "product" && _id in $ids]{
        _id, name, price, "imageUrl": image.asset->url, slug
      }`,
      { ids: productIds }
    );

    // Merge product details into order
    const mergedOrders = orders.map((order: any) => ({
      ...order,
      products: order.products.map((p: any) => ({
        ...p,
        productId: products.find((prod: any) => prod._id === p.productId) || {},
      })),
    }));

    return NextResponse.json(mergedOrders);
  } catch (err: any) {
    console.error("❌ Order List Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
