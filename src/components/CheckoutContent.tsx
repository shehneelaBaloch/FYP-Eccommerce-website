"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { client } from "@/lib/sanity";
import { Product } from "@/types";
import { 
  CreditCard, 
  Home, 
  Loader2, 
  Truck, 
  Shield, 
  ArrowLeft,
  CheckCircle,
  MapPin,
  ShoppingCart,
  User,
  Plus
} from "lucide-react";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

// ✅ Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "");

interface Address {
  fullName: string;
  contact: string;
  address: string;
  city: string;
  postal: string;
  isDefault: boolean;
}

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
  quantity: number;
}

export function CheckoutContent() {
  const router = useRouter();
  const params = useSearchParams();
  const productId = params.get("productId");
  const checkoutType = params.get("type") || (productId ? 'direct' : 'cart');
  const { data: session } = useSession();

  const [product, setProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online" | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [address, setAddress] = useState({
    fullName: session?.user?.name || "",
    contact: "",
    address: "",
    city: "",
    postal: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [addressOption, setAddressOption] = useState<"saved" | "new">("new");
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);

  // ✅ Fetch cart items from database API
  const fetchCartItems = async () => {
    if (!session?.user?.id) return [];
    
    try {
      const res = await fetch(`/api/cart/list?userId=${session.user.id}`);
      const data = await res.json();
      return data || [];
    } catch (err) {
      console.error("Failed to fetch cart items:", err);
      return [];
    }
  };

  // ✅ Clear cart after successful order
  const clearCart = async () => {
    if (!session?.user?.id) return;
    
    try {
      await fetch(`/api/cart/clear?userId=${session.user.id}`, {
        method: "DELETE",
      });
      console.log("Cart cleared successfully");
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  // ✅ Fetch product, cart details, and saved addresses
  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        if (checkoutType === 'direct' && productId) {
          // Direct purchase - fetch single product
          const data = await client.fetch(
            `*[_type == "product" && _id == $id][0]{ _id, name, price, "imageUrl": image.asset->url }`,
            { id: productId }
          );
          setProduct(data);
        } else if (checkoutType === 'cart') {
          // Cart purchase - fetch cart items from database
          const items = await fetchCartItems();
          setCartItems(items);
          
          if (items.length === 0) {
            toast.error("Your cart is empty");
            router.push('/cart');
            return;
          }
        }

        // Fetch saved addresses if user is logged in
        if (session?.user?.id) {
          const addressesRes = await fetch(`/api/address?userId=${session.user.id}`);
          const addressesData = await addressesRes.json();
          if (addressesData.success && addressesData.addresses.length > 0) {
            setSavedAddresses(addressesData.addresses);
            setAddressOption("saved");
            
            // Set default address as selected
            const defaultAddressIndex = addressesData.addresses.findIndex((addr: Address) => addr.isDefault);
            if (defaultAddressIndex !== -1) {
              setSelectedAddressIndex(defaultAddressIndex);
              // Pre-fill form with default address
              const defaultAddress = addressesData.addresses[defaultAddressIndex];
              setAddress({
                fullName: defaultAddress.fullName,
                contact: defaultAddress.contact,
                address: defaultAddress.address,
                city: defaultAddress.city,
                postal: defaultAddress.postal,
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to load checkout data:", err);
        toast.error("Failed to load checkout data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCheckoutData();
  }, [productId, checkoutType, session, router]);

  // ✅ Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // ✅ Handle saved address selection
  const handleSavedAddressSelect = (index: number) => {
    setSelectedAddressIndex(index);
    const selectedAddress = savedAddresses[index];
    setAddress({
      fullName: selectedAddress.fullName,
      contact: selectedAddress.contact,
      address: selectedAddress.address,
      city: selectedAddress.city,
      postal: selectedAddress.postal,
    });
  };

  // ✅ Validate address
  const validateAddress = () => {
    const errors: Record<string, string> = {};
    if (!address.fullName.trim()) errors.fullName = "Full name is required";
    if (!address.contact.trim()) errors.contact = "Contact number is required";
    if (!address.address.trim()) errors.address = "Address is required";
    if (!address.city.trim()) errors.city = "City is required";
    if (!address.postal.trim()) errors.postal = "Postal code is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ Calculate totals based on checkout type
  const calculateTotals = () => {
    const shipping = 10;
    let subtotal = 0;

    if (checkoutType === 'direct' && product) {
      subtotal = product.price;
    } else if (checkoutType === 'cart') {
      subtotal = cartItems.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);
    }

    const total = subtotal + shipping;
    return { subtotal, shipping, total };
  };

  const { subtotal, shipping, total } = calculateTotals();

  // ✅ Stripe Checkout Redirect
  const handleStripeRedirect = async () => {
    if (!validateAddress()) {
      toast.error("Please fill in all address details");
      return;
    }
    
    setProcessing(true);
    try {
      const stripe: Stripe | null = await stripePromise;
      if (!stripe) throw new Error("Stripe not initialized!");

      const userEmail = session?.user?.email || "guest@example.com";

      // Prepare items based on checkout type
      const items = checkoutType === 'direct' && product 
        ? [{ 
            name: product.name, 
            price: product.price, 
            quantity: 1,
            productId: product._id 
          }]
        : cartItems.map(item => ({ 
            name: item.product?.name, 
            price: item.product?.price, 
            quantity: item.quantity,
            productId: item.product?._id 
          }));

      const res = await fetch("/api/stripe/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items,
          email: userEmail,
          address: address,
          checkoutType: checkoutType,
          productId: checkoutType === 'direct' ? productId : null,
        }),
      });

      const sessionData = await res.json();

      if (sessionData?.url) {
        // Clear cart for cart checkout before redirecting to Stripe
        if (checkoutType === 'cart') {
          await clearCart();
        }
        window.location.href = sessionData.url;
      } else {
        toast.error("Failed to create Stripe session");
      }
    } catch (err) {
      toast.error("Payment redirect failed");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  // ✅ Save COD Order
  const handleCODSubmit = async () => {
    if (!validateAddress()) {
      toast.error("Please fill in all address details");
      return;
    }

    setProcessing(true);
    try {
      const userEmail = session?.user?.email || "guest@example.com";

      if (checkoutType === 'direct' && product) {
        // Single product COD order
        await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: userEmail,
            productId: product._id,
            productName: product.name,
            totalAmount: total,
            address,
            paymentMethod: "Cash on Delivery",
            status: "Pending",
            checkoutType: 'direct'
          }),
        });
        toast.success(`Order placed for ${product.name} via Cash on Delivery!`);
        
        // Redirect to success page with checkout_type
        setTimeout(() => router.push("/success?checkout_type=direct"), 2000);
        
      } else if (checkoutType === 'cart') {
        // Cart COD order - CLEAR cart after successful order
        await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: userEmail,
            items: cartItems.map(item => ({
              productId: item.product?._id,
              productName: item.product?.name,
              quantity: item.quantity,
              price: item.product?.price
            })),
            totalAmount: total,
            address,
            paymentMethod: "Cash on Delivery",
            status: "Pending",
            checkoutType: 'cart'
          }),
        });
        
        // Clear cart after successful COD order
        await clearCart();
        toast.success(`Order placed for ${cartItems.length} items via Cash on Delivery!`);
        
        // Redirect to success page with checkout_type
        setTimeout(() => router.push("/success?checkout_type=cart"), 2000);
      }
    } catch (err) {
      toast.error("Failed to save order");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentMethodSelect = (method: "cod" | "online") => {
    setPaymentMethod(method);
    setActiveStep(2);
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    } else {
      router.back();
    }
  };

  // Check if we can proceed to review
  const canProceedToReview = () => {
    return address.fullName && address.contact && address.address && address.city && address.postal;
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={40} />
          <p className="text-gray-600">Loading your order...</p>
        </div>
      </div>
    );

  if ((checkoutType === 'direct' && !product) || (checkoutType === 'cart' && cartItems.length === 0))
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">
            {checkoutType === 'direct' ? 'Product not found.' : 'Your cart is empty.'}
          </p>
          <button 
            onClick={() => router.push("/")}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );

  return (
    <section className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="container mx-auto px-4 mb-8">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Checkout
        </h1>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          {checkoutType === 'cart' ? (
            <>
              <ShoppingCart size={18} />
              <span>Cart Purchase ({cartItems.length} items)</span>
            </>
          ) : (
            <>
              <CheckCircle size={18} />
              <span>Direct Purchase</span>
            </>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Checkout Steps */}
          <div className="lg:flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 lg:p-8"
            >
              {/* Progress Steps */}
              <div className="flex justify-between items-center mb-8 relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 -z-10"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-purple-600 -translate-y-1/2 transition-all duration-300 -z-10"
                  style={{ width: `${(activeStep / 3) * 100}%` }}
                ></div>
                
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      activeStep >= step 
                        ? 'bg-purple-600 border-purple-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {activeStep > step ? <CheckCircle size={20} /> : step}
                    </div>
                    <span className="text-xs mt-2 text-gray-600">
                      {step === 1 ? 'Payment' : step === 2 ? 'Address' : 'Review'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Step 1: Payment Method Selection */}
              <AnimatePresence mode="wait">
                {activeStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Payment Method</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePaymentMethodSelect("cod")}
                        className="p-6 border-2 rounded-xl text-left transition-all hover:border-purple-400 hover:bg-purple-50 group"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                            <Home className="text-purple-600" size={24} />
                          </div>
                          <span className="font-semibold text-gray-800">Cash on Delivery</span>
                        </div>
                        <p className="text-sm text-gray-600">Pay when you receive your order</p>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePaymentMethodSelect("online")}
                        className="p-6 border-2 rounded-xl text-left transition-all hover:border-pink-400 hover:bg-pink-50 group"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition">
                            <CreditCard className="text-pink-600" size={24} />
                          </div>
                          <span className="font-semibold text-gray-800">Online Payment</span>
                        </div>
                        <p className="text-sm text-gray-600">Pay securely with Stripe</p>
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Address Form */}
                {activeStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <MapPin className="text-purple-600" size={24} />
                      <h3 className="text-xl font-semibold text-gray-800">Delivery Address</h3>
                    </div>

                    {/* Address Option Selection */}
                    {savedAddresses.length > 0 && (
                      <div className="mb-6">
                        <div className="flex gap-4 mb-4">
                          <button
                            onClick={() => setAddressOption("saved")}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                              addressOption === "saved"
                                ? "bg-purple-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            <User size={16} />
                            Use Saved Address
                          </button>
                          <button
                            onClick={() => setAddressOption("new")}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                              addressOption === "new"
                                ? "bg-purple-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            <Plus size={16} />
                            New Address
                          </button>
                        </div>

                        {/* Saved Addresses List */}
                        {addressOption === "saved" && (
                          <div className="grid gap-3 mb-4">
                            {savedAddresses.map((savedAddress, index) => (
                              <div
                                key={index}
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                  selectedAddressIndex === index
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                                onClick={() => handleSavedAddressSelect(index)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-medium text-gray-900">
                                        {savedAddress.fullName}
                                      </span>
                                      {savedAddress.isDefault && (
                                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                          Default
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600">{savedAddress.contact}</p>
                                    <p className="text-sm text-gray-600">{savedAddress.address}</p>
                                    <p className="text-sm text-gray-600">
                                      {savedAddress.city}, {savedAddress.postal}
                                    </p>
                                  </div>
                                  {selectedAddressIndex === index && (
                                    <CheckCircle className="text-purple-600" size={20} />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Address Form */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { key: "fullName", label: "Full Name", type: "text" },
                        { key: "contact", label: "Contact Number", type: "tel" },
                        { key: "address", label: "Street Address", type: "text", fullWidth: true },
                        { key: "city", label: "City", type: "text" },
                        { key: "postal", label: "Postal Code", type: "text" },
                      ].map((field) => (
                        <div key={field.key} className={field.fullWidth ? "md:col-span-2" : ""}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label}
                          </label>
                          <input
                            type={field.type}
                            value={address[field.key as keyof typeof address]}
                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition ${
                              formErrors[field.key] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder={`Enter your ${field.label.toLowerCase()}`}
                          />
                          {formErrors[field.key] && (
                            <p className="text-red-500 text-sm mt-1">{formErrors[field.key]}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => setActiveStep(1)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => {
                          if (canProceedToReview()) {
                            setActiveStep(3);
                          } else {
                            toast.error("Please fill in all address details");
                          }
                        }}
                        className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                      >
                        Continue to Review
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Order Review */}
                {activeStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">Review Your Order</h3>

                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                      <h4 className="font-semibold text-gray-800">Order Details</h4>
                      {checkoutType === 'direct' && product ? (
                        <div className="flex items-center gap-4">
                          <img
                            src={product.imageUrl || "/placeholder.png"}
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{product.name}</p>
                            <p className="text-pink-600 font-semibold">${product.price}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {cartItems.map((item) => (
                            <div key={item._id} className="flex items-center gap-4">
                              <img
                                src={item.product?.imageUrl || "/placeholder.png"}
                                alt={item.product?.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{item.product?.name}</p>
                                <p className="text-pink-600 font-semibold">
                                  ${item.product?.price} × {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Address Review */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Delivery Address</h4>
                      <p className="text-gray-700">{address.fullName}</p>
                      <p className="text-gray-700">{address.contact}</p>
                      <p className="text-gray-700">{address.address}</p>
                      <p className="text-gray-700">{address.city}, {address.postal}</p>
                      {addressOption === "saved" && (
                        <p className="text-sm text-purple-600 mt-2">
                          ✓ Using saved address
                        </p>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Payment Method</h4>
                      <div className="flex items-center gap-3">
                        {paymentMethod === "cod" ? (
                          <>
                            <Home className="text-purple-600" size={20} />
                            <span className="text-gray-700">Cash on Delivery</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="text-pink-600" size={20} />
                            <span className="text-gray-700">Online Payment (Stripe)</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => setActiveStep(2)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Back
                      </button>
                      <button
                        onClick={paymentMethod === "cod" ? handleCODSubmit : handleStripeRedirect}
                        disabled={processing}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin" size={20} />
                            {paymentMethod === "cod" ? "Placing Order..." : "Redirecting..."}
                          </div>
                        ) : (
                          `Complete ${paymentMethod === "cod" ? "COD Order" : "Payment"}`
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Security Badges */}
            <div className="flex items-center justify-center gap-6 mt-6 text-gray-500">
              <div className="flex items-center gap-2">
                <Shield size={16} />
                <span className="text-sm">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={16} />
                <span className="text-sm">Free Shipping</span>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-96">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6 sticky top-8"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>$0.00</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-semibold text-gray-800">
                  <span>Total</span>
                  <span className="text-lg">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Product Preview */}
              <div className="mt-6 pt-6 border-t">
                {checkoutType === 'direct' && product ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={product.imageUrl || "/placeholder.png"}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                      <p className="text-xs text-gray-600">Qty: 1</p>
                    </div>
                    <span className="text-sm font-semibold text-pink-600">${product.price}</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-800 mb-2">
                      {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in cart
                    </p>
                    {cartItems.slice(0, 3).map((item) => (
                      <div key={item._id} className="flex items-center gap-3">
                        <img
                          src={item.product?.imageUrl || "/placeholder.png"}
                          alt={item.product?.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{item.product?.name}</p>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {cartItems.length > 3 && (
                      <p className="text-xs text-gray-600 text-center">
                        +{cartItems.length - 3} more items
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
