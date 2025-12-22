import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectionToDatabase from "../../../../lib/mongoose";
import Order from "../../../../models/Order";

// ✅ FIXED: Removed the extra '{' that was at the end of this block
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
  key_secret: process.env.RAZORPAY_KEY_SECRET,
}); 

export async function POST(req) {
  try {
    // 1. Connect to Database
    await connectionToDatabase();

    const body = await req.json();
    const {
      userId, items, restaurantId, totalCount,
      totalPrice, gst, deliveryCharge, grandTotal, aa
    } = body;

    // 2. Validation
    if (!grandTotal || isNaN(grandTotal)) {
      return NextResponse.json({ success: false, message: "Invalid Total Amount" }, { status: 400 });
    }

    const customOrderId = `ORD-${Date.now().toString().slice(-8)}`;

    // 3. Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(grandTotal) * 100), // Amount in Paise
      currency: "INR",
      receipt: customOrderId,
    });

    // 4. Save to MongoDB
  const newOrder = await Order.create({
  userId,
  items,
  totalCount,
  totalPrice,
  gst,
  deliveryCharge,
  grandTotal,
  restaurantId,
  orderId: customOrderId,           // Matches schema
  razorpayOrderId: razorpayOrder.id, // Matches schema
  paymentStatus: "Pending",         // Matches schema
  aa,
});

    // 5. Success Response
    return NextResponse.json({
      success: true,
      dbOrderId: newOrder._id,
      razorpayOrderId: razorpayOrder.id,
    });

  } catch (error) {
    // Check your VS Code terminal for this log!
    console.error("SERVER ERROR:", error); 
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    }, { status: 500 });
  }
}