import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectionToDatabase from "../../../../lib/mongoose";
import Order from "../../../../models/Order";
import { generateOrderId } from "../../../../lib/generateOrderId"; // ✅ Adjust path to your file

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
  key_secret: process.env.RAZORPAY_KEY_SECRET,
}); 

export async function POST(req) {
  try {
    await connectionToDatabase();
    const body = await req.json();
    const { userId, items, restaurantId, grandTotal, location, aa, totalPrice, gst, deliveryCharge, totalCount } = body;

    // ✅ 1. Use your custom function to get "ORD-001001"
    const formattedOrderId = await generateOrderId();

    // 2. Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(grandTotal) * 100),
      currency: "INR",
      receipt: formattedOrderId, 
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
      orderId: formattedOrderId, // ✅ Saves as "ORD-001001"
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "Pending",
      location, 
    });

    return NextResponse.json({ 
      success: true, 
      razorpayOrderId: razorpayOrder.id, 
      dbOrderId: newOrder._id,
      displayOrderId: formattedOrderId 
    });

  } catch (error) {
    console.error("CRITICAL BACKEND ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}