import { NextResponse } from "next/server";
import connectionToDatabase from "lib/mongoose"; 
import FinalOrder from "../../../../models/FinalOrder"; 

export async function GET(request) {
    try {
        await connectionToDatabase(); // Ensure connection
        
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // This query now hits the 'finalcompletedorders' collection
        const orders = await FinalOrder.find({ userId: userId })
            .sort({ orderDate: -1 }); 
        
        return NextResponse.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
