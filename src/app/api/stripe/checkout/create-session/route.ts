// /api/stripe/checkout/create-session/route.ts
import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const stripe = getStripeClient();
    const { items, email, address, checkoutType = 'cart', productId } = await req.json();

    // Validate input based on checkout type
    if (checkoutType === 'cart' && (!items || items.length === 0)) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    
    if (checkoutType === 'direct' && !productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Create metadata for the order
    const metadata = {
      checkoutType,
      productId: checkoutType === 'direct' ? productId : 'multiple',
      customer_email: email,
      address: address ? JSON.stringify(address) : '',
      itemCount: checkoutType === 'cart' ? items.length.toString() : '1'
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: items.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: { 
            name: item.name,
            metadata: { productId: item.productId || productId }
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity || 1,
      })),
      // ✅ IMPORTANT: Include checkout_type in success URL
      success_url: `${process.env.NEXTAUTH_URL}/success?session_id={CHECKOUT_SESSION_ID}&checkout_type=${checkoutType}${productId ? `&productId=${productId}` : ''}`,
      cancel_url: `${process.env.NEXTAUTH_URL}${checkoutType === 'direct' ? `/product/${productId}` : '/cart'}`,
      metadata: metadata,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}