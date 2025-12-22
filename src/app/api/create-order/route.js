import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectionToDatabase from "../../../../lib/mongoose";
import Order from "../../../../models/Order";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
  key_secret: process.env.RAZORPAY_KEY_SECRET,
}); 

export async function POST(req) {
  try {
    await connectionToDatabase();
    const body = await req.json();
    const { userId, items, restaurantId, grandTotal, location, aa, totalPrice, gst, deliveryCharge, totalCount } = body;

    // 1. Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(grandTotal) * 100),
      currency: "INR",
      receipt: `ORD-${Date.now()}`,
    });

    // 2. Save to MongoDB
    const newOrder = await Order.create({
      userId, items, restaurantId, totalCount, totalPrice, gst, deliveryCharge, grandTotal, aa,
      orderId: razorpayOrder.receipt,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "Pending",
      location, // ✅ MUST BE PASSED HERE
    });

    return NextResponse.json({ success: true, razorpayOrderId: razorpayOrder.id, dbOrderId: newOrder._id });
  } catch (error) {
    console.error("CRITICAL BACKEND ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}