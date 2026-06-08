import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ProductVector from "@/lib/model/ProductVector";
import { getTextEmbedding, cosineSimilarity } from "@/lib/embedding";

export const dynamic = "force-dynamic";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query || query.trim().length < 1)
      return NextResponse.json({ results: [] });

    await dbConnect();
    const normalizedQuery = query.toLowerCase();

    // Get all products
    const allProducts = await ProductVector.find({}).lean();

    // Step 1️⃣: Strict keyword-based filtering
    const keywordMatches = allProducts.filter((p) => {
      const name = (p.name || "").toLowerCase();
      return (
        name.startsWith(normalizedQuery) ||
        name.includes(normalizedQuery) ||
        normalizedQuery.includes(name)
      );
    });

    // Step 2️⃣: If we have decent keyword hits → return them sorted alphabetically
    if (keywordMatches.length > 0) {
      const sorted = keywordMatches
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 10);
      return NextResponse.json({ results: sorted });
    }

    // Step 3️⃣: Otherwise, use AI vector similarity (semantic fallback)
    const queryVector = await getTextEmbedding(query);
    const vectorResults = allProducts
      .map((p) => ({
        ...p,
        score: cosineSimilarity(queryVector, p.vector),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    return NextResponse.json({ results: vectorResults });
  } catch (err) {
    console.error("Hybrid Search Error:", err);
    return NextResponse.json({ results: [] });
  }
}
