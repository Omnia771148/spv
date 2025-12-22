import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectionToDatabase from "../../../../lib/mongoose";
import Order from "../../../../models/Order";
import Counter from "../../../../models/counter"; // ✅ Import the Counter model

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
  key_secret: process.env.RAZORPAY_KEY_SECRET,
}); 

export async function POST(req) {
  try {
    await connectionToDatabase();
    const body = await req.json();
    const { userId, items, restaurantId, grandTotal, location, aa, totalPrice, gst, deliveryCharge, totalCount } = body;

    // 1. Get Auto-incrementing Order ID (Starting from 1000)
    const counter = await Counter.findOneAndUpdate(
      { id: "orderId" },
      { $inc: { seq: 1 } }, // Increment by 1
      { new: true, upsert: true } // Create if doesn't exist
    );

    const customOrderId = counter.seq; // This will be 1001, 1002, etc.

    // 2. Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(grandTotal) * 100),
      currency: "INR",
      receipt: String(customOrderId), // ✅ Using the numeric ID as receipt
    });

    // 3. Save to MongoDB
    const newOrder = await Order.create({
      userId, 
      items, 
      restaurantId, 
      totalCount, 
      totalPrice, 
      gst, 
      deliveryCharge, 
      grandTotal, 
      aa,
      orderId: customOrderId, // ✅ Now saved as 1001, 1002...
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "Pending",
      location, 
    });

    return NextResponse.json({ 
      success: true, 
      razorpayOrderId: razorpayOrder.id, 
      dbOrderId: newOrder._id,
      numericOrderId: customOrderId // Useful for the frontend success message
    });

  } catch (error) {
    console.error("CRITICAL BACKEND ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}