'use client';
import { useState, useEffect } from "react";

export default function DisCart({ name, handleRemove, price, onTotalChange }) {
  const [count, setCount] = useState(1);

  function increment() {
    setCount(count + 1);
  }

  function decrement() {
    if (count > 1) {
      setCount(count - 1);
    }
  }

  const itemTotal = price * count;
  const gst = itemTotal * 0.05;          // ✅ 5% GST
  const finalTotal = itemTotal + gst;    // ✅ Total with GST

  useEffect(() => {
    if (onTotalChange) {
      onTotalChange(finalTotal);          // ✅ send GST included total
    }
  }, [count]);

  return (
    <div className="Dis">
      <div className="Dis">

        <h3 className="Discart">{name}</h3>

        <p>Item Price: ₹{itemTotal}</p>
        <p>GST (5%): ₹{gst.toFixed(2)}</p>

        <h4>Total: ₹{finalTotal.toFixed(2)}</h4>

        <button onClick={handleRemove}>Remove</button><br />

        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        {count}

      </div>
    </div>
  );
}
