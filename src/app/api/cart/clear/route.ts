import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Cart from "@/lib/model/Cart";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    await connectDB();
    await Cart.deleteMany({ userId }); // ✅ Clear all items for that user
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Clear cart error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
