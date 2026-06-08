import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Order from "@/lib/model/Order"; // ✅ corrected folder name if it’s models not model
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  try {
    // 🔹 Parse JSON body
    const {
      userId,
      userEmail,
      products,
      address,
      paymentMethod,
      transactionId,
    } = await req.json();

    // 🔹 Validate input
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, message: "No products provided" },
        { status: 400 }
      );
    }

    if (!address || !address.fullName || !address.contact) {
      return NextResponse.json(
        { success: false, message: "Incomplete address information" },
        { status: 400 }
      );
    }

    await connectDB();

    // 🔹 Compute total amount
    const totalAmount = products.reduce(
      (sum: number, p: any) => sum + p.priceSnapshot * p.quantity,
      0
    );

    // 🔹 Create new order
    const newOrder = await Order.create({
      userId: userId || null,
      userEmail: userEmail || "guest@example.com",
      products: products.map((p: any) => ({
        productId: p.productId,
        name: p.name,
        quantity: p.quantity,
        priceSnapshot: p.priceSnapshot,
        imageUrl: p.imageUrl || "",
      })),
      address,
      paymentMethod: paymentMethod || "COD",
      totalAmount,
      transactionId: transactionId || null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully!",
        orderId: newOrder._id,
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Order API Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
