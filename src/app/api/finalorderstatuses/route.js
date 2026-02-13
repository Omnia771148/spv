import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectionToDatabase from "lib/mongoose";
import OrderStatus from "../../../../models/OrderStatus";

export async function GET(request) {
  try {
    await connectionToDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid or missing userId" },
        { status: 400 }
      );
    }

    // 1. Immediate Cleanup: Delete rejected orders updated > 1 min ago
    // We use $or to handle cases where timestamps might be new
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    await OrderStatus.deleteMany({
      status: { $regex: 'rejected', $options: 'i' },
      updatedAt: { $lt: oneMinuteAgo }
    });



    // 3. Fetch orders
    const orders = await OrderStatus.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
