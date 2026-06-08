import { Suspense } from "react";
import { CheckoutContent } from "@/components/CheckoutContent";
import { Loader2 } from "lucide-react";

function CheckoutSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="text-center">
        <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={40} />
        <p className="text-gray-600">Loading checkout...</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutContent />
    </Suspense>
  );
}