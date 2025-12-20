'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function MyOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Authentication check
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        const res = await axios.get(`/api/orders?userId=${userId}`);
        setOrders(res.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Checking authentication...</p>;

  return (
    <div className="mt-4">
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order, index) => (
          <div key={index} className="border p-3 mb-3 rounded">
            <h5>Restaurant ID: {order.restaurantId}</h5>
            <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
            <ul>
              {order.items.map((item, idx) => (
                <li key={idx}>
                  {item.name} - ₹{item.price} x {item.quantity}
                </li>
              ))}
            </ul>
            <p><strong>Total:</strong> ₹{order.totalPrice}</p>
          </div>
        ))
      )}
    </div>
  );
}
