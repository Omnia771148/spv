"use client";

import { useEffect, useState } from "react";
import Loading from '../loading/page';

export default function RazorpayItemsPage() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const res = await fetch(
        `/api/accepted-orders?userId=${userId}`,
        { cache: "no-store" }
      );

      const data = await res.json();

      // ✅ Keep orderId, remove userId, slice razorpayOrderId
      const formatted = data
        .filter(o => o.razorpayOrderId)
        .map(o => ({
          orderId: o.orderId,
          razorpayRef: o.razorpayOrderId.slice(-5),
          items: o.items,
          totalPrice: o.totalPrice,
        }));

      setOrders(formatted);
      setLoading(false);
    };

    fetchOrders();
  }, []);
  if (loading) {
    return <Loading />;
  }

  if (orders.length === 0)
    return <p className="p-4" style={{ backgroundColor: '#F8F5EB', minHeight: '100vh' }}>No paid orders found</p>;

  return (
    <div className="p-4 space-y-4" style={{ backgroundColor: '#F8F5EB', minHeight: '100vh' }}>
      <h2 className="text-xl font-bold">
        Orders & Payment References
      </h2>

      {orders.map((order, index) => (
        <div
          key={index}
          className="border rounded-lg p-4 shadow"
        >
          {/* Order ID */}
          <div className="mb-1 font-semibold">
            Order ID: {order.orderId}
          </div>

          {/* Razorpay last 5 */}
          <div className="text-sm text-gray-600 mb-2">
            Payment Ref: {order.razorpayRef}
          </div>

          {/* Items */}
          <div className="space-y-1">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between text-sm"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <hr className="my-2" />

          <div className="text-right font-semibold">
            Total: ₹{order.totalPrice}
          </div>
        </div>
      ))}
    </div>
  );
}
