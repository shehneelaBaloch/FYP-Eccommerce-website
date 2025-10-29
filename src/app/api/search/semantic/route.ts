import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ProductVector from "@/lib//model/ProductVector";
import { getTextEmbedding, cosineSimilarity } from "@/lib/embedding";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { query } = await req.json();
  if (!query) return NextResponse.json({ results: [] });

  await dbConnect();

  // Get user query embedding
  const queryVector = await getTextEmbedding(query);

  // Fetch all stored embeddings
  const allProducts = await ProductVector.find({}).lean();

  // Rank by cosine similarity
  const results = allProducts
    .map((p) => ({
      ...p,
      score: cosineSimilarity(queryVector, p.vector),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return NextResponse.json({ results });
}
