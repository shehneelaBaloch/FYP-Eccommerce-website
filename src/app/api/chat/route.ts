import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";
import { productsQuery } from "@/lib/queries";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { message } = await request.json();

  if (!message)
    return NextResponse.json({ reply: "Please type a message first 📝" });

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey)
    return NextResponse.json({
      reply: "Gemini API key missing in .env.local 😔",
    });

  try {
    const products = await client.fetch(productsQuery);

    const productList = products
      .slice(0, 15)
      .map((p: any) => `${p.name} ($${p.price}) - ${p.category}`)
      .join("\n");

    const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          parts: [
            {
              text: `You are ShopieBot 🤖, an AI shopping assistant for Shopie Store.
Here are some real products available in the store:
${productList}

If the user's query matches a product (like 'watch', 'hoodie', 'sneakers', etc.), reply naturally first,
then include a JSON object labeled "products" (with name, price, imageUrl) on a **separate line** starting with "###JSON###".

User: ${message}`,
            },
          ],
        },
      ],
      generationConfig: { temperature: 0.4 },
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error("Gemini error:", await res.text());
      return NextResponse.json({
        reply: "ShopieBot is warming up 💤 — please try again shortly.",
      });
    }

    const data = await res.json();
    const rawReply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm not sure how to respond right now 🤔";

    // --- 🧩 Extract JSON block if exists ---
    let reply = rawReply;
    let productsList: any[] = [];

    const jsonMarker = rawReply.indexOf("###JSON###");
    if (jsonMarker !== -1) {
      reply = rawReply.slice(0, jsonMarker).trim();
      const jsonText = rawReply.slice(jsonMarker + 10).trim();

      try {
        const parsed = JSON.parse(jsonText);
        if (parsed?.products && Array.isArray(parsed.products)) {
          productsList = parsed.products;
        }
      } catch (err) {
        console.warn("JSON parse failed:", err);
      }
    }

    // --- 🪄 Manual fallback if no JSON found ---
    if (productsList.length === 0) {
      const keyword = message.toLowerCase();
      productsList = products
        .filter((p: any) =>
          [p.name, p.category, p.description]
            .join(" ")
            .toLowerCase()
            .includes(keyword)
        )
        .slice(0, 4);
    }

    return NextResponse.json({ reply, products: productsList });
  } catch (err) {
    console.error("🔥 Chat API error:", err);
    return NextResponse.json({
      reply: "ShopieBot is currently offline 😔 — please try again later.",
    });
  }
}
