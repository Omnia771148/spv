'use client';
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [userId, setUserId] = useState("");

  useEffect(() => {
    // Get userId from localStorage
    const storedId = localStorage.getItem("userId");
    if (storedId) {
      setUserId(storedId);
    }
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Welcome!</h2>
      <p>Your user ID is: <strong>{userId}</strong></p>
    </div>
  );
}
