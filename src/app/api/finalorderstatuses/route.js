import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectionToDatabase from "../../../../lib/mongoose";
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

    const orders = await OrderStatus.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ orderDate: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
