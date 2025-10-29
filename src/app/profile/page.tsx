"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2, Heart, Package, MapPin, User, Camera, Upload } from "lucide-react";
import toast from "react-hot-toast";

interface Tab {
  id: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
  quantity: number;
}

interface WishlistItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
}

interface Order {
  _id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  products: Array<{
    productId: {
      _id: string;
      name: string;
    };
    priceSnapshot: number;
    quantity: number;
  }>;
}

interface Address {
  fullName: string;
  contact: string;
  address: string;
  city: string;
  postal: string;
  isDefault: boolean;
}

interface ProfileData {
  phone: string;
  imageUrl: string;
  addresses: Address[];
}

const tabs: Tab[] = [
  { id: "Personal Info", icon: User },
  { id: "Address", icon: MapPin },
  { id: "Orders", icon: Package },
  { id: "Wishlist", icon: Heart },
];

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("Personal Info");
  const [phone, setPhone] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState<Address>({
    fullName: "",
    contact: "",
    address: "",
    city: "",
    postal: "",
    isDefault: false
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState("All");

  const userId = session?.user?.id;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [cartRes, wishlistRes, ordersRes, profileRes] = await Promise.all([
          fetch(`/api/cart/list?userId=${userId}`).then((r) => r.json()),
          fetch(`/api/wishlist/list?userId=${userId}`).then((r) => r.json()),
          fetch(`/api/orders/list?userId=${userId}`).then((r) => r.json()),
          fetch('/api/profile').then((r) => r.json()),
        ]);

        setCart(Array.isArray(cartRes) ? cartRes : []);
        setWishlist(Array.isArray(wishlistRes) ? wishlistRes : []);
        setOrders(Array.isArray(ordersRes) ? ordersRes : []);
        
        // Set profile data including saved image URL
        if (profileRes) {
          setPhone(profileRes.phone || "");
          // Use saved image URL from profile, fallback to session image
          setImageUrl(profileRes.imageUrl || session?.user?.image || "");
          setAddresses(profileRes.addresses || []);
        }
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (status === "authenticated") fetchData();
  }, [status, userId, session?.user?.image]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId || '');

      const uploadRes = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (uploadData.success) {
        const newImageUrl = uploadData.imageUrl;
        setImageUrl(newImageUrl);
        
        await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            phone, 
            addresses, 
            imageUrl: newImageUrl 
          }),
        });

        await update({
          ...session,
          user: {
            ...session?.user,
            image: newImageUrl
          }
        });

        toast.success("Profile picture updated successfully!");
      } else {
        toast.error(uploadData.message || "Failed to upload image");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const removeProfileImage = async () => {
    setIsUploading(true);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone, 
          addresses, 
          imageUrl: "" 
        }),
      });

      setImageUrl("");
      
      await update({
        ...session,
        user: {
          ...session?.user,
          image: ""
        }
      });

      toast.success("Profile picture removed successfully!");
    } catch (err) {
      console.error("Remove image error:", err);
      toast.error("Failed to remove profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      await fetch(`/api/cart/remove?userId=${userId}&productId=${productId}`, {
        method: "DELETE",
      });
      setCart((prev) => prev.filter((i) => i.product._id !== productId));
      toast.success("Item removed from cart");
    } catch (err) {
      console.error("Remove from cart failed:", err);
      toast.error("Failed to remove item from cart");
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await fetch(`/api/wishlist/remove?userId=${userId}&productId=${productId}`, {
        method: "DELETE",
      });
      setWishlist((prev) => prev.filter((i) => i.productId._id !== productId));
      toast.success("Item removed from wishlist");
    } catch (err) {
      console.error("Remove from wishlist failed:", err);
      toast.error("Failed to remove item from wishlist");
    }
  };

  const addToCartFromWishlist = async (productId: string) => {
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity: 1 }),
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success("Added to cart!");
      }
    } catch (err) {
      console.error("Add to cart failed:", err);
      toast.error("Failed to add to cart");
    }
  };

  const addNewAddress = async () => {
    if (!newAddress.fullName || !newAddress.contact || !newAddress.address || !newAddress.city || !newAddress.postal) {
      toast.error("Please fill in all address fields");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          address: newAddress
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setAddresses(data.addresses);
        setNewAddress({
          fullName: "",
          contact: "",
          address: "",
          city: "",
          postal: "",
          isDefault: false
        });
        toast.success("Address added successfully!");
      } else {
        toast.error(data.message || "Failed to add address");
      }
    } catch (err) {
      console.error("Add address error:", err);
      toast.error("Failed to add address");
    } finally {
      setIsLoading(false);
    }
  };

  const updateAddress = async () => {
    if (editingIndex === null) return;
    
    if (!newAddress.fullName || !newAddress.contact || !newAddress.address || !newAddress.city || !newAddress.postal) {
      toast.error("Please fill in all address fields");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/address', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          addressIndex: editingIndex,
          address: newAddress
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setAddresses(data.addresses);
        setNewAddress({
          fullName: "",
          contact: "",
          address: "",
          city: "",
          postal: "",
          isDefault: false
        });
        setEditingIndex(null);
        toast.success("Address updated successfully!");
      } else {
        toast.error(data.message || "Failed to update address");
      }
    } catch (err) {
      console.error("Update address error:", err);
      toast.error("Failed to update address");
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultAddress = async (index: number) => {
    setIsLoading(true);
    try {
      const addressToUpdate = { ...addresses[index], isDefault: true };
      
      const res = await fetch('/api/address', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          addressIndex: index,
          address: addressToUpdate
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setAddresses(data.addresses);
        toast.success("Default address updated!");
      } else {
        toast.error(data.message || "Failed to update default address");
      }
    } catch (err) {
      console.error("Set default address error:", err);
      toast.error("Failed to update default address");
    } finally {
      setIsLoading(false);
    }
  };

  const removeAddress = async (index: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/address?userId=${userId}&addressIndex=${index}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      
      if (data.success) {
        setAddresses(data.addresses);
        toast.success("Address removed successfully!");
      } else {
        toast.error(data.message || "Failed to remove address");
      }
    } catch (err) {
      console.error("Remove address error:", err);
      toast.error("Failed to remove address");
    } finally {
      setIsLoading(false);
    }
  };

  const editAddress = (index: number) => {
    setNewAddress(addresses[index]);
    setEditingIndex(index);
  };

  const cancelEditing = () => {
    setNewAddress({
      fullName: "",
      contact: "",
      address: "",
      city: "",
      postal: "",
      isDefault: false
    });
    setEditingIndex(null);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, addresses, imageUrl }),
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
  const safeCart = Array.isArray(cart) ? cart : [];

  const filteredOrders =
    orderFilter === "All"
      ? safeOrders
      : safeOrders.filter(
          (o: Order) =>
            o.status?.toLowerCase() === orderFilter.toLowerCase()
        );

  const getCartTotal = () =>
    safeCart.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600 text-sm">
            Manage your account information and preferences
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid md:grid-cols-4 gap-6 p-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg p-4 text-white">
                <div className="text-center mb-4">
                  <div className="relative inline-block mb-3 group">
                    <div className="relative">
                      <img
                        src={imageUrl || session.user?.image || "/default-avatar.png"}
                        alt="Profile"
                        className="w-16 h-16 rounded-xl object-cover border-2 border-white/30"
                      />
                      <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={20} className="text-white" />
                      </div>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                        <span className="bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-1 rounded-lg transition-colors flex items-center justify-center gap-1">
                          {isUploading ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <Upload size={12} />
                          )}
                          {isUploading ? "Uploading..." : "Change Photo"}
                        </span>
                      </label>
                      
                      {imageUrl && (
                        <button
                          onClick={removeProfileImage}
                          disabled={isUploading}
                          className="text-white/80 hover:text-white text-xs transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <h2 className="text-sm font-bold mb-1 truncate">
                    {session.user?.name}
                  </h2>
                  <p className="text-purple-200 text-xs break-words">
                    {session.user?.email}
                  </p>
                </div>

                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium flex items-center gap-2 ${
                          activeTab === tab.id
                            ? "bg-white/20 backdrop-blur-sm"
                            : "hover:bg-white/10"
                        }`}
                      >
                        <IconComponent size={14} />
                        <span>{tab.id}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              <div className="h-full flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {activeTab}
                  </h3>
                  <div className="w-8 h-0.5 bg-purple-600 rounded-full"></div>
                </div>

                <div className="flex-1 space-y-6">
                  {/* Personal Info */}
                  {activeTab === "Personal Info" && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-md font-semibold mb-3 text-gray-800 flex items-center gap-2">
                          <Camera size={18} />
                          Profile Picture
                        </h4>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img
                              src={imageUrl || session.user?.image || "/default-avatar.png"}
                              alt="Profile"
                              className="w-20 h-20 rounded-lg object-cover border-2 border-gray-300"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-2">
                              Upload a new profile picture. JPG, PNG, or WebP. Max 5MB.
                            </p>
                            <div className="flex gap-2">
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                  disabled={isUploading}
                                />
                                <span className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                                  {isUploading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  ) : (
                                    <Upload size={16} />
                                  )}
                                  {isUploading ? "Uploading..." : "Upload Image"}
                                </span>
                              </label>
                              
                              {imageUrl && (
                                <button
                                  onClick={removeProfileImage}
                                  disabled={isUploading}
                                  className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name
                            </label>
                            <div className="bg-gray-50 rounded-lg px-3 py-2 text-gray-600 text-sm">
                              {session.user?.name}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email Address
                            </label>
                            <div className="bg-gray-50 rounded-lg px-3 py-2 text-gray-600 text-sm">
                              {session.user?.email}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {activeTab === "Address" && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-md font-semibold mb-4 text-gray-800">
                          Saved Addresses
                        </h4>
                        {addresses.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                            <MapPin size={32} className="mx-auto mb-2 text-gray-400" />
                            <p className="text-gray-600 text-sm mb-1">No saved addresses</p>
                            <p className="text-gray-400 text-xs">Add your first address below</p>
                          </div>
                        ) : (
                          <div className="grid gap-4">
                            {addresses.map((address, index) => (
                              <div
                                key={index}
                                className={`border rounded-lg p-4 ${
                                  address.isDefault 
                                    ? 'border-purple-500 bg-purple-50' 
                                    : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">
                                      {address.fullName}
                                    </span>
                                    {address.isDefault && (
                                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => editAddress(index)}
                                      className="text-blue-600 hover:text-blue-800 text-xs"
                                    >
                                      Edit
                                    </button>
                                    {!address.isDefault && (
                                      <button
                                        onClick={() => setDefaultAddress(index)}
                                        className="text-purple-600 hover:text-purple-800 text-xs"
                                      >
                                        Set Default
                                      </button>
                                    )}
                                    <button
                                      onClick={() => removeAddress(index)}
                                      className="text-red-500 hover:text-red-700 text-xs"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600">{address.contact}</p>
                                <p className="text-sm text-gray-600">{address.address}</p>
                                <p className="text-sm text-gray-600">
                                  {address.city}, {address.postal}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-md font-semibold mb-4 text-gray-800">
                          {editingIndex !== null ? 'Edit Address' : 'Add New Address'}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              value={newAddress.fullName}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, fullName: e.target.value }))}
                              placeholder="John Doe"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Contact Number *
                            </label>
                            <input
                              type="text"
                              value={newAddress.contact}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, contact: e.target.value }))}
                              placeholder="+1 (555) 000-0000"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Street Address *
                            </label>
                            <input
                              type="text"
                              value={newAddress.address}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="123 Main Street"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City *
                            </label>
                            <input
                              type="text"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                              placeholder="New York"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Postal Code *
                            </label>
                            <input
                              type="text"
                              value={newAddress.postal}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, postal: e.target.value }))}
                              placeholder="10001"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <div className="md:col-span-2 flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="defaultAddress"
                              checked={newAddress.isDefault}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <label htmlFor="defaultAddress" className="text-sm text-gray-700">
                              Set as default address
                            </label>
                          </div>
                          <div className="md:col-span-2 flex gap-2">
                            <button
                              onClick={editingIndex !== null ? updateAddress : addNewAddress}
                              disabled={isLoading}
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm"
                            >
                              {isLoading ? 'Saving...' : (editingIndex !== null ? 'Update Address' : 'Add Address')}
                            </button>
                            {editingIndex !== null && (
                              <button
                                onClick={cancelEditing}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors text-sm"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Orders */}
                  {activeTab === "Orders" && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-md font-semibold mb-3 text-gray-800 flex items-center gap-2">
                          <ShoppingBag size={18} />
                          Current Cart
                        </h4>
                        {safeCart.length > 0 ? (
                          <div className="space-y-3">
                            {safeCart.map((item) => (
                              <div
                                key={item._id}
                                className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
                              >
                                <Image
                                  src={item.product?.imageUrl || "/default-product.png"}
                                  alt={item.product?.name || "Product"}
                                  width={50}
                                  height={50}
                                  className="rounded object-contain bg-white"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 text-sm truncate">
                                    {item.product?.name}
                                  </h4>
                                  <p className="text-xs text-gray-600">
                                    ${item.product?.price?.toFixed(2)} × {item.quantity}
                                  </p>
                                </div>
                                <button
                                  onClick={() => removeFromCart(item.product._id)}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                            <div className="flex justify-between items-center pt-2">
                              <span className="text-sm font-semibold">Total:</span>
                              <span className="text-lg font-bold text-purple-600">
                                ${getCartTotal().toFixed(2)}
                              </span>
                            </div>
                            <Link
                              href="/cart"
                              className="block w-full text-center bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
                            >
                              Go to Checkout
                            </Link>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-500 py-4">
                            <ShoppingBag size={32} className="mb-2" />
                            <p className="text-sm">No items in your cart</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-semibold text-gray-800 flex items-center gap-2">
                            <Package size={18} />
                            Order History
                          </h4>
                          <div className="flex gap-1">
                            {["All", "Delivered", "Pending", "Cancelled"].map((status) => (
                              <button
                                key={status}
                                onClick={() => setOrderFilter(status)}
                                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                                  orderFilter === status
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>

                        {filteredOrders.length > 0 ? (
                          <div className="space-y-3">
                            {filteredOrders.map((order, idx) => (
                              <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-medium text-gray-900 text-sm">Order #{order._id?.slice(-6) || idx + 1}</p>
                                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                      {order.status}
                                    </span>
                                    <p className="text-sm font-bold text-gray-900 mt-1">
                                      ${order.totalAmount?.toFixed(2) || "0.00"}
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  {Array.isArray(order.products) && order.products.slice(0, 2).map((p: any, pIdx: number) => (
                                    <div key={pIdx} className="flex items-center gap-2 text-xs">
                                      <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                                        <Package size={10} />
                                      </div>
                                      <span className="flex-1 truncate">{p.productId?.name || "Unnamed"}</span>
                                      <span className="text-gray-600">Qty: {p.quantity}</span>
                                    </div>
                                  ))}
                                  {order.products && order.products.length > 2 && (
                                    <p className="text-xs text-gray-500 text-center">
                                      +{order.products.length - 2} more items
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                            <Package size={32} className="mx-auto mb-2 text-gray-400" />
                            <p className="text-gray-600 text-sm">No orders found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Wishlist */}
                  {activeTab === "Wishlist" && (
                    <div>
                      {safeWishlist.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                          <Heart size={32} className="mx-auto mb-2 text-gray-400" />
                          <p className="text-gray-600 text-sm mb-1">Your wishlist is empty</p>
                          <p className="text-gray-400 text-xs">Start adding products you love</p>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {safeWishlist.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200"
                            >
                              <Image
                                src={item.productId?.imageUrl || "/default-product.png"}
                                alt={item.productId?.name || "Product"}
                                width={60}
                                height={60}
                                className="rounded object-contain bg-white"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 text-sm truncate">
                                  {item.productId?.name || "Unnamed"}
                                </h4>
                                <p className="text-lg font-bold text-purple-600">
                                  ${item.productId?.price?.toFixed(2) || "0.00"}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => addToCartFromWishlist(item.productId._id)}
                                  className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors"
                                >
                                  Add to Cart
                                </button>
                                <button
                                  onClick={() => removeFromWishlist(item.productId._id)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Save Button */}
                {(activeTab === "Personal Info" || activeTab === "Address") && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm"
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