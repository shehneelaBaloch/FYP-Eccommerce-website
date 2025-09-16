'use client';

import React from 'react';
import { CheckCircle, Truck, CreditCard, Star } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold mb-4">About <span className="text-yellow-300">ShopEase</span></h1>
          <p className="text-lg max-w-2xl mx-auto">
            Redefining online shopping with quality, trust, and seamless experiences.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <p className="text-lg text-gray-600 mb-4">
            ShopEase was founded with a simple mission — to make fashion and lifestyle products 
            accessible to everyone. From trendy outfits to everyday essentials, we provide a curated 
            collection that combines quality and affordability.
          </p>
          <p className="text-lg text-gray-600">
            We don’t just sell products, we create experiences. Every order is packed with love, care, 
            and a commitment to deliver happiness at your doorstep.
          </p>
        </div>
        <div>
          <img
            src="/images/about/fashion-store.jpg"
            alt="ShopEase store"
            className="rounded-2xl shadow-lg"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Why Shop With Us?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="p-6 rounded-xl border bg-gray-50 hover:shadow-lg transition">
              <Truck className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Fast Delivery</h3>
              <p className="text-gray-600 text-sm mt-2">Get your products delivered at lightning speed, right to your doorstep.</p>
            </div>
            <div className="p-6 rounded-xl border bg-gray-50 hover:shadow-lg transition">
              <CreditCard className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Secure Payments</h3>
              <p className="text-gray-600 text-sm mt-2">Shop with confidence using our 100% secure payment options.</p>
            </div>
            <div className="p-6 rounded-xl border bg-gray-50 hover:shadow-lg transition">
              <CheckCircle className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Quality Assured</h3>
              <p className="text-gray-600 text-sm mt-2">We carefully select every product to ensure premium quality for our customers.</p>
            </div>
            <div className="p-6 rounded-xl border bg-gray-50 hover:shadow-lg transition">
              <Star className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Customer First</h3>
              <p className="text-gray-600 text-sm mt-2">Our support team is always here to assist you with your shopping journey.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 text-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-0">
            Ready to explore the latest trends?
          </h2>
          <a
            href="/products"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-6 rounded-lg shadow-md transition"
          >
            Shop Now
          </a>
        </div>
      </div>
    </div>
  );
}
