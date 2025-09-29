import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Cart from "@/lib/model/Cart";

export async function POST(req: Request) {
  try {
    const { userId, productId, quantity = 1 } = await req.json();

    // ✅ Input validation
    if (!userId || !productId) {
      return NextResponse.json(
        { error: "User ID and Product ID are required" },
        { status: 400 }
      );
    }

    // ✅ Ensure DB connection
    await connectDB();

    // ✅ Add or increment item in cart
    const cartItem = await Cart.findOneAndUpdate(
      { userId, productId },
      { $inc: { quantity } },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, cartItem });
  } catch (err: any) {
    console.error("❌ Cart Add Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
