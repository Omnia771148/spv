"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FinalOrderStatuses() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      router.push("/login");
      return;
    }

    fetch(`/api/finalorderstatuses?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading your orders...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>My Orders</h1>

      {orders.length === 0 && <p>No orders found</p>}

      {orders.map((order) => (
        <div
          key={order._id}
          style={{
            border: "1px solid #ccc",
            padding: 15,
            marginBottom: 20,
            borderRadius: 8,
          }}
        >
          <h3>Order ID: {order.orderId}</h3>

          <p><b>Status:</b> {order.status}</p>
          <p><b>Payment:</b> {order.paymentStatus}</p>
          <p><b>Restaurant ID:</b> {order.restaurantId}</p>
          <p><b>Order Date:</b> {new Date(order.orderDate).toLocaleString()}</p>
          <p><b>AA:</b> {order.aa}</p>

          <hr />

          <h4>Items</h4>
          {order.items.map((item, i) => (
            <p key={i}>
              {item.name} × {item.quantity} — ₹{item.price}
            </p>
          ))}

          <hr />

          <p>Total Count: {order.totalCount}</p>
          <p>Total Price: ₹{order.totalPrice}</p>
          <p>GST: ₹{order.gst}</p>
          <p>Delivery Charge: ₹{order.deliveryCharge}</p>
          <p><b>Grand Total: ₹{order.grandTotal}</b></p>

          <hr />

          <p>Razorpay Order ID: {order.razorpayOrderId}</p>
          <p>Razorpay Payment ID: {order.razorpayPaymentId}</p>

          <hr />

          {order.location?.mapUrl && (
            <a href={order.location.mapUrl} target="_blank">
              View Delivery Location
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
