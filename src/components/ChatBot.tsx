'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, XCircle } from 'lucide-react';
import Image from 'next/image';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  products?: Product[];
}

interface Product {
  _id?: string;
  name: string;
  price: number;
  imageUrl: string;
}

const QUICK_REPLIES = [
  "What's trending today? ✨",
  "Show me watches ⌚",
  "Sneakers under $50 👟",
  "Red hoodies ❤️",
  "Return policy ↩️",
];

// ✅ URL validation function
const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};

// ✅ Function to get safe image URL
const getSafeImageUrl = (url: string): string => {
  if (!url || !isValidUrl(url)) {
    return '/placeholder.png';
  }
  return url;
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hey there! 👋 I'm ShopieBot 🤖 — your smart assistant for **Shopie Store**. Ask me about products, orders, or deals anytime!",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  // 💬 Send Message
  const sendMessage = async (msg?: string) => {
    const text = msg || input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { text, isUser: true, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      
      // ✅ Validate and sanitize product image URLs
      const safeProducts = data.products?.map((product: Product) => ({
        ...product,
        imageUrl: getSafeImageUrl(product.imageUrl)
      })) || [];

      const botMsg: Message = {
        text: data.reply,
        isUser: false,
        timestamp: new Date(),
        products: safeProducts,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          text: "ShopieBot is currently unavailable 😔. Please try again later or contact us at support@shopiestore.com 💌",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-br from-pink-600 to-purple-600 hover:scale-110 transition-all text-white p-4 rounded-full shadow-lg"
      >
        💬
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 sm:w-96 h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold text-lg">ShopieBot 🤖</h3>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-80">
              <XCircle size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    m.isUser
                      ? 'bg-pink-600 text-white rounded-br-none'
                      : 'bg-white border rounded-bl-none text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {/* ✅ Product Cards with safe image URLs */}
                  {m.products && m.products.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      {m.products.map((p, idx) => (
                        <div
                          key={p._id || `${p.name}-${idx}`}
                          className="flex items-center gap-3 p-2 border rounded-lg hover:bg-pink-50 transition"
                        >
                          <Image
                            src={getSafeImageUrl(p.imageUrl)}
                            alt={p.name}
                            width={48}
                            height={48}
                            className="rounded-md object-cover border"
                            onError={(e) => {
                              // ✅ Fallback on image load error
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.png';
                            }}
                          />
                          <div>
                            <p className="font-semibold text-sm">{p.name}</p>
                            <p className="text-xs text-pink-600">${p.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] mt-2 opacity-60">
                    {m.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="text-gray-500 text-sm italic flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} /> ShopieBot is thinking…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="p-2 bg-white border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {QUICK_REPLIES.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  disabled={isLoading}
                  className="bg-pink-50 text-pink-700 border border-pink-200 px-3 py-1 rounded-full text-xs hover:bg-pink-100 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={2}
              placeholder="Ask about products, orders, or deals..."
              className="w-full border rounded-xl p-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className="mt-2 w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl py-2 font-semibold hover:opacity-90 transition"
            >
              {isLoading ? 'Thinking…' : 'Send'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-1">
              Powered by Gemini 2.5 Flash ⚡
            </p>
          </div>
        </div>
      )}
    </div>
  );
}