"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

const tabs = ["Personal Info", "Address", "Orders", "Wishlist", "Security"];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Personal Info");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState("All");

  const userId = session?.user?.id;

  // 🔐 Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // ✅ Fetch Cart, Wishlist, Orders
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [cartRes, wishlistRes, ordersRes] = await Promise.all([
          fetch(`/api/cart/list?userId=${userId}`).then((r) => r.json()),
          fetch(`/api/wishlist/list?userId=${userId}`).then((r) => r.json()),
          fetch(`/api/orders/list?userId=${userId}`).then((r) => r.json()),
        ]);
        setCart(cartRes || []);
        setWishlist(wishlistRes || []);
        setOrders(ordersRes || []);
      } catch (err) {
        console.error("❌ Failed to fetch profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (status === "authenticated") fetchData();
  }, [status, userId]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!session) return null;

  // 📌 Save profile info
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, address, imageUrl }),
      });
    } catch (err) {
      console.error("❌ Error saving profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Filtered orders
  const filteredOrders =
    orderFilter === "All" ? orders : orders.filter((o) => o.status === orderFilter.toLowerCase());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 mt-10">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-12 gap-8 p-8">
            {/* Sidebar */}
            <div className="md:col-span-4 lg:col-span-3">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
                {/* Profile Card */}
                <div className="text-center mb-6">
                  <div className="relative inline-block mb-4">
                    <img
                      src={imageUrl || session.user?.image || "/default-avatar.png"}
                      alt="Profile"
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 shadow-lg"
                    />
                    <label className="absolute bottom-0 right-0 bg-white text-purple-600 p-2 rounded-full cursor-pointer hover:bg-gray-100 shadow-lg transition-all duration-200">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setImageUrl(url);
                          }
                        }}
                        className="hidden"
                      />
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </label>
                  </div>
                  <h2 className="text-xl font-bold mb-1 truncate">{session.user?.name}</h2>
                  <p className="text-purple-200 text-sm break-words">{session.user?.email}</p>
                </div>

                {/* Navigation Tabs */}
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                        activeTab === tab
                          ? "bg-white/20 backdrop-blur-sm shadow-lg"
                          : "hover:bg-white/10"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-8 lg:col-span-9">
              <div className="h-full flex flex-col">
                {/* Tab Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{activeTab}</h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 space-y-6">
                  {/* Personal Info */}
                  {activeTab === "Personal Info" && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <div className="bg-gray-50 rounded-xl px-4 py-3 text-gray-600">
                            {session.user?.name}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="bg-gray-50 rounded-xl px-4 py-3 text-gray-600">
                            {session.user?.email}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {/* Orders */}
                  {activeTab === "Orders" && (
                    <div>
                      {/* Filter Tabs */}
                      <div className="flex gap-3 mb-6">
                        {["All", "Received", "Pending", "Cancelled"].map((status) => (
                          <button
                            key={status}
                            onClick={() => setOrderFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                              orderFilter === status
                                ? "bg-purple-600 text-white shadow"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>

                      {filteredOrders.length === 0 ? (
                        <p className="text-gray-600">No orders found</p>
                      ) : (
                        <div className="overflow-x-auto bg-white rounded-xl shadow">
                          <table className="min-w-full text-sm text-left border-collapse">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 font-semibold text-gray-600">Product</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">Price</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">Quantity</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">Total</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">Payment</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredOrders.map((order, idx) =>
                                order.products.map((p: any, pIdx: number) => (
                                  <tr
                                    key={`${idx}-${pIdx}`}
                                    className="border-t hover:bg-gray-50 transition-colors"
                                  >
                                    <td className="px-6 py-4">{p.productId?.name || "Unnamed"}</td>
                                    <td className="px-6 py-4">${p.priceSnapshot.toFixed(2)}</td>
                                    <td className="px-6 py-4">{p.quantity}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                      ${(p.priceSnapshot * p.quantity).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">{order.paymentMethod}</td>
                                    <td className="px-6 py-4 capitalize">{order.status}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Wishlist */}
                  {activeTab === "Wishlist" && (
                    <div>
                      {wishlist.length === 0 ? (
                        <p className="text-gray-600">Your wishlist is empty</p>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                          {wishlist.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl shadow"
                            >
                              <Image
                                src={item.productId?.imageUrl || "/default-product.png"}
                                alt={item.productId?.name || "Product"}
                                width={64}
                                height={64}
                                className="rounded-lg object-contain bg-white"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">
                                  {item.productId?.name || "Unnamed"}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  ${item.productId?.price?.toFixed(2) || "0.00"}
                                </p>
                              </div>
                              <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
                                Add to Cart
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Save Button */}
                {(activeTab === "Personal Info" || activeTab === "Address") && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-medium shadow hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
