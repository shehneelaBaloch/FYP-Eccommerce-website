"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { CheckCircle, ShoppingBag, Package } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  
  const sessionId = searchParams.get('session_id');
  const checkoutType = searchParams.get('checkout_type'); // 'cart' or 'direct'
  const productId = searchParams.get('productId');

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        // Only clear cart if this was a CART purchase
        if (checkoutType === 'cart' && session?.user?.id) {
          // Clear cart from localStorage
          localStorage.removeItem('cart');
          
          // Also clear from backend if you have cart API
          try {
            await fetch(`/api/cart/clear?userId=${session.user.id}`, {
              method: "DELETE",
            });
          } catch (err) {
            console.log("Backend cart clear failed, but localStorage cleared");
          }
          
          toast.success("Payment successful! Your cart has been cleared.");
        } else if (checkoutType === 'direct') {
          // For direct purchases, DO NOT clear the cart
          toast.success("Payment successful! Your product will be shipped soon.");
        } else {
          toast.success("Payment successful!");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error handling success:", err);
        toast.error("Payment succeeded, but there was an issue processing your order.");
        setLoading(false);
      }
    };

    handleSuccess();
  }, [session, checkoutType]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-green-50 via-white to-green-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600">Processing your order...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-green-50 via-white to-green-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="text-green-600" size={48} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Payment Successful! 🎉
        </h1>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          {checkoutType === 'cart' ? (
            <>
              <ShoppingBag size={20} className="text-gray-600" />
              <p className="text-gray-700">Cart Purchase Completed</p>
            </>
          ) : (
            <>
              <Package size={20} className="text-gray-600" />
              <p className="text-gray-700">Direct Purchase Completed</p>
            </>
          )}
        </div>

        <p className="text-gray-600 mb-6">
          {checkoutType === 'cart' 
            ? 'Thank you for your order! Your cart has been cleared.'
            : 'Thank you for your purchase! Your product will be shipped soon.'
          }
        </p>

        <div className="space-y-4">
          <Link 
            href="/"
            className="block w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition text-center"
          >
            Continue Shopping
          </Link>
          
          <Link 
            href="/orders"
            className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition text-center"
          >
            View My Orders
          </Link>

          {checkoutType === 'cart' && (
            <p className="text-xs text-gray-500 mt-4">
              Your cart has been cleared as requested
            </p>
          )}
        </div>
      </div>
    </div>
  );
}