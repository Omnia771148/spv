import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../../lib/mongoose";
import FinalOrder from "../../../../../models/FinalOrder";

export async function GET(request, { params }) {
    try {
        await connectionToDatabase();
        
        const { id } = params;
        console.log("🔍 Looking for order with ID:", id);
        
        // First try to find by MongoDB _id
        let order = await FinalOrder.findById(id);
        
        // If not found by _id, try by orderId
        if (!order) {
            console.log("🔍 Not found by _id, trying orderId:", id);
            order = await FinalOrder.findOne({ orderId: id });
        }
        
        // If still not found, try by any string match
        if (!order) {
            console.log("🔍 Not found by orderId, trying text search");
            order = await FinalOrder.findOne({ 
                $or: [
                    { orderId: { $regex: id, $options: 'i' } },
                    { _id: id }
                ]
            });
        }
        
        if (!order) {
            console.log("❌ Order not found");
            return NextResponse.json({ 
                error: "Order not found",
                message: `No order found with ID: ${id}`
            }, { status: 404 });
        }
        
        console.log("✅ Order found:", order.orderId);
        return NextResponse.json(order);
    } catch (error) {
        console.error("❌ Error fetching order:", error);
        return NextResponse.json({ 
            error: "Failed to fetch order",
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}