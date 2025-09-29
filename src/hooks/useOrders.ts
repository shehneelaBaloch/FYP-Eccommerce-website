"use client";

import { useEffect, useState } from "react";

interface Order {
  _id?: string;
  userId: string;
  products: {
    productId: any;
    quantity: number;
    priceSnapshot: number;
  }[];
  status: "pending" | "received" | "cancelled";
  paymentMethod: "COD" | "Stripe" | "Paypal";
  totalAmount: number;
}

export function useOrders(userId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch orders
  const fetchOrders = async () => {
    if (!userId) return;
    setLoading(true);
    const res = await fetch(`/api/orders/list?userId=${userId}`);
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  };

  // 🔹 Create new order
  const createOrder = async (products: any[], paymentMethod = "COD") => {
    if (!userId) return;
    await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, products, paymentMethod }),
    });
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  return { orders, loading, createOrder, fetchOrders };
}
