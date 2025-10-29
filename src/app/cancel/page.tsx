export default function CancelPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Canceled ❌</h1>
      <p className="text-gray-600">Your payment was not completed. You can try again later.</p>
      <a href="/cart" className="mt-6 text-purple-600 font-medium hover:underline">Return to Cart</a>
    </div>
  );
}
