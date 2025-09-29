import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Order from "@/lib/model/Order";

export async function POST(req: Request) {
  try {
    const { userId, products, paymentMethod } = await req.json();
    await connectDB();

    const totalAmount = products.reduce(
      (sum: number, p: any) => sum + p.priceSnapshot * p.quantity,
      0
    );

    const order = await Order.create({
      userId,
      products,
      paymentMethod,
      totalAmount,
    });

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
