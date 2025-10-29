// app/api/wishlist/toggle/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Wishlist, { IWishlist } from "@/lib/model/Wishlist";

interface RequestBody {
  userId: string;
  productId: string;
}

interface ToggleResponse {
  success: boolean;
  removed?: boolean;
  message?: string;
  error?: string;
  item?: IWishlist;
}

export async function POST(req: Request): Promise<NextResponse<ToggleResponse>> {
  try {
    const { userId, productId }: RequestBody = await req.json();
    
    if (!userId || !productId) {
      return NextResponse.json(
        { error: "User ID and Product ID are required", success: false },
        { status: 400 }
      );
    }

    await connectDB();

    // Find existing item
    const existing: IWishlist | null = await Wishlist.findOne({ userId, productId });
    
    if (existing) {
      await Wishlist.findByIdAndDelete(existing._id);
      return NextResponse.json({ 
        success: true, 
        removed: true,
        message: "Removed from wishlist" 
      });
    }

    // Create new item
    const newItem: IWishlist = await Wishlist.create({ userId, productId });
    return NextResponse.json({ 
      success: true, 
      item: newItem,
      message: "Added to wishlist" 
    });
  } catch (err: any) {
    console.error("❌ Wishlist Toggle Error:", err.message);
    return NextResponse.json({ 
      error: err.message, 
      success: false 
    }, { status: 500 });
  }
}