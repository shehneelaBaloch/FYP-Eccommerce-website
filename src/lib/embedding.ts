import crypto from "crypto";

export async function getTextEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY!;
  const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text: `Convert the following product description into a numerical embedding vector of 64 floating-point values. Return only a comma-separated list of numbers.

Text: ${text}`,
          },
        ],
      },
    ],
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!raw) throw new Error("❌ Failed to generate embedding");

  const numbers = raw
    .split(",")
    .map((n: string) => parseFloat(n.trim()))
    .filter((n: number) => !isNaN(n));

  // fallback if parsing fails
  return numbers.length ? numbers : Array(64).fill(0).map((_, i) => Math.sin(i));
}

// quick cosine similarity helper
export function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return dot / (magA * magB || 1);
}
