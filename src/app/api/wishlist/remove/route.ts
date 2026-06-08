// app/api/wishlist/remove/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Wishlist, { IWishlist } from "@/lib/model/Wishlist";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");
    
    if (!userId || !productId) {
      return NextResponse.json(
        { error: "User ID and Product ID are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Remove item with string IDs
    const result: IWishlist | null = await Wishlist.findOneAndDelete({ userId, productId });
    
    if (!result) {
      return NextResponse.json(
        { error: "Item not found in wishlist" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Removed from wishlist" 
    });
  } catch (err: any) {
    console.error("❌ Wishlist Remove Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}