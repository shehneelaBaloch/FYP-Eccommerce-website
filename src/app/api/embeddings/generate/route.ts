import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";
import { productsQuery } from "@/lib/queries";

import dbConnect from "@/lib/dbConnect";
import ProductVector from "@/lib/model/ProductVector";
import { getTextEmbedding } from "@/lib/embedding";

export const runtime = "nodejs";

export async function GET() {
  await dbConnect();
  const products = await client.fetch(productsQuery);

  for (const p of products) {
    const existing = await ProductVector.findOne({ productId: p._id });
    if (existing) continue;

    const text = `${p.name} ${p.category || ""} ${p.description || ""}`;
    const vector = await getTextEmbedding(text);
    await ProductVector.create({
      productId: p._id,
      name: p.name,
      description: p.description,
      vector,
    });
    console.log("✅ Embedded:", p.name);
  }

  return NextResponse.json({ success: true });
}
