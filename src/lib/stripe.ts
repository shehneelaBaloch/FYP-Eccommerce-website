import Stripe from "stripe";

let cachedStripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (cachedStripe) return cachedStripe;

  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY is not defined");
  }

  cachedStripe = new Stripe(apiKey, {
    apiVersion: "2025-09-30.clover",
  });

  return cachedStripe;
}
