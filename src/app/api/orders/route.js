import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/mongoose";
import Order from "../../../../models/Order";
import {generateOrderId} from "../../../../lib/generateOrderId";  // ✅ FIXED

export async function POST(request) {
  try {
    await connectionToDatabase();

    const { userId, items, restaurantId, aa } = await request.json();

    if (!userId || !items || !restaurantId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderId = await generateOrderId(); // ✅ call async function

    const newOrder = new Order({
      userId,
      items,
      totalCount,
      totalPrice,
      restaurantId,
      aa,
      orderId,
      orderDate: new Date(),
    });

    await newOrder.save();

    return NextResponse.json(newOrder, { status: 200 });
  } catch (err) {
    console.error("Order save error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectionToDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId in query" }, { status: 400 });
    }

    const userOrders = await Order.find({ userId }).sort({ orderDate: -1 });

    return NextResponse.json(userOrders, { status: 200 });
  } catch (err) {
    console.error("Fetch order error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
