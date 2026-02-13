import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectionToDatabase from "lib/mongoose";
import OrderStatus from "../../../../models/OrderStatus";
import AcceptedOrder from "../../../../models/acceptedOrders";
import FinalOrder from "../../../../models/FinalOrder";

export async function GET(request) {
    try {
        await connectionToDatabase();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "UserId required" }, { status: 400 });
        }

        console.log(`Checking active orders for userId: ${userId}`);

        // 1. Check OrderStatus (userId is String in schema)
        // Status NOT in Finished states
        const activeOrderStatus = await OrderStatus.findOne({
            userId: userId,
            status: { $nin: ["Delivered", "Cancelled", "Completed", "Rejected"] }
        });

        // 2. Check AcceptedOrder (userId is ObjectId in schema)
        // We assume presence in AcceptedOrder means it's active/accepted/in-progress
        let activeAcceptedOrder = null;
        if (mongoose.Types.ObjectId.isValid(userId)) {
            activeAcceptedOrder = await AcceptedOrder.findOne({
                userId: new mongoose.Types.ObjectId(userId)
            });
        }

        // 3. Check FinalOrder (userId is String)
        // Check if there is any order that is NOT fully completed/delivered
        const activeFinalOrder = await FinalOrder.findOne({
            userId: userId,
            status: { $nin: ["Delivered", "Cancelled", "Completed", "Rejected"] }
        });

        console.log("Active OrderStatus found:", !!activeOrderStatus);
        console.log("Active AcceptedOrder found:", !!activeAcceptedOrder);
        console.log("Active FinalOrder found:", !!activeFinalOrder);

        const activeOrder = activeOrderStatus || activeAcceptedOrder || activeFinalOrder;
        const hasActiveOrder = !!activeOrder;

        let storedLocation = null;
        if (hasActiveOrder && activeOrder.location) {
            storedLocation = activeOrder.location;
        }

        return NextResponse.json({ hasActiveOrder, storedLocation });
    } catch (error) {
        console.error("Check active order error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
