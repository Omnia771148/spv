"use client";

import { useEffect, useState } from "react";

export default function AcceptedOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAcceptedOrders = async () => {
      try {
        const userId = localStorage.getItem("userId");

        if (!userId) {
          setError("User not logged in");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `/api/accepted-orders?userId=${userId}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch accepted orders");
        }

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while fetching orders");
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedOrders();
  }, []);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Loading accepted orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>No accepted orders found</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Accepted Orders</h1>

      {orders.map((order) => (
        <div
          key={order._id}
          className="border rounded-lg p-4 shadow-sm"
        >
          <div className="flex justify-between mb-2">
            <span className="font-semibold">
              Order ID: {order.orderId}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(order.orderDate).toLocaleString()}
            </span>
          </div>

          <div className="space-y-1">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between text-sm"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <hr className="my-2" />

          <div className="flex justify-between font-semibold">
            <span>Total Items: {order.totalCount}</span>
            <span>Total: ₹{order.totalPrice}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
