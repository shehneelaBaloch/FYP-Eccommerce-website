import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const stripe = getStripeClient();
    const { amount, email } = await req.json();

    if (!amount) {
      return NextResponse.json({ error: "Amount missing" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: "usd",
      receipt_email: email,
      description: "Shopie Inline Checkout",
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Stripe Intent Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
