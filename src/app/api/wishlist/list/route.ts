import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Wishlist from "@/lib/model/Wishlist";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  try {
    await connectDB();
    const wishlist = await Wishlist.find({ userId }).populate("productId");
    return NextResponse.json(wishlist);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
