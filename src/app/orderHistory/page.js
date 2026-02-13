'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectUser } from 'lib/features/userSlice';

export default function MyOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Authentication check
  const user = useSelector(selectUser);

  // ✅ REDUX Authentication check
  useEffect(() => {
    // Similar safety check: if Redux is empty AND localStorage is empty, then redirect.
    // This allows the AuthInitializer time to work if localStorage HAS data.
    if (!user && !localStorage.getItem("userId")) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router, user]);

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

  if (loading) return <p style={{ backgroundColor: '#F8F5EB', minHeight: '100vh', padding: '20px' }}>Checking authentication...</p>;

  return (
    <div style={{ backgroundColor: '#F8F5EB', minHeight: '100vh', padding: '20px' }}>
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
