import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Wishlist from "@/lib/model/Wishlist";

export async function POST(req: Request) {
  try {
    const { userId, productId } = await req.json();
    await connectDB();

    const existing = await Wishlist.findOne({ userId, productId });
    if (existing) {
      await Wishlist.findByIdAndDelete(existing._id);
      return NextResponse.json({ success: true, removed: true });
    }

    const newItem = await Wishlist.create({ userId, productId });
    return NextResponse.json({ success: true, item: newItem });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
