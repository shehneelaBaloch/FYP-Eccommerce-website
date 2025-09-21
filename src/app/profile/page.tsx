'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const tabs = ["Personal Info", "Address", "Orders", "Wishlist", "Security"];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Personal Info");

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return <div className="p-6 text-center">Loading profile...</div>;
  }

  if (!session) return null;

  const handleSave = async () => {
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, address, imageUrl }),
    });
    alert("Profile saved!");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 pt-20">
      <div className="bg-white shadow-lg rounded-xl p-6">
        {/* Profile header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-28 h-28">
            <img
              src={imageUrl || session.user?.image || "/default-avatar.png"}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-purple-600 shadow-md"
            />
            <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700">
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
              📷
            </label>
          </div>
          <h2 className="text-xl font-bold mt-3">{session.user?.name}</h2>
          <p className="text-gray-600 text-sm">{session.user?.email}</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-4 border-b">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-4 text-sm">
          {activeTab === "Personal Info" && (
            <div>
              <h3 className="text-base font-semibold mb-2">Personal Information</h3>
              <p><strong>Name:</strong> {session.user?.name}</p>
              <p><strong>Email:</strong> {session.user?.email}</p>
              <div className="mt-3">
                <label className="block font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {activeTab === "Address" && (
            <div>
              <h3 className="text-base font-semibold mb-2">Saved Address</h3>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          )}

          {activeTab === "Orders" && (
            <div>
              <h3 className="text-base font-semibold mb-2">Your Orders</h3>
              <p className="text-gray-600">No orders yet.</p>
            </div>
          )}

          {activeTab === "Wishlist" && (
            <div>
              <h3 className="text-base font-semibold mb-2">Wishlist</h3>
              <p className="text-gray-600">Your wishlist is empty.</p>
            </div>
          )}

          {activeTab === "Security" && (
            <div>
              <h3 className="text-base font-semibold mb-2">Security</h3>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
              />
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">
                Update Password
              </button>
            </div>
          )}
        </div>

        {/* Save button */}
        {(activeTab === "Personal Info" || activeTab === "Address") && (
          <div className="mt-5 text-center">
            <button
              onClick={handleSave}
              className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
