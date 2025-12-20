import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/mongoose";
import AcceptedOrder from "../../../../models/acceptedOrders";


export async function GET(request) {
  try {
    await connectionToDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId in query" },
        { status: 400 }
      );
    }

    const acceptedOrders = await AcceptedOrder
      .find({ userId })
      .sort({ orderDate: -1 });

    return NextResponse.json(acceptedOrders, { status: 200 });
  } catch (err) {
    console.error("Fetch accepted order error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
