import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectionToDatabase from "lib/mongoose";
import OrderStatus from "../../../../models/OrderStatus";

export async function GET() {
    try {
        await connectionToDatabase();

        // Access the collection directly - using .db to access native driver
        const collection = mongoose.connection.db.collection("orderstatuses");

        // Drop ALL indexes (except _id)
        try {
            await collection.dropIndexes();
            console.log("Dropped all indexes");
        } catch (e) {
            console.log("Error dropping indexes (might be none):", e.message);
        }

        // Re-sync from schema
        await OrderStatus.syncIndexes();

        return NextResponse.json({ success: true, message: "Fixed Indexes Successfully" });

    } catch (error) {
        console.error("Index Fix Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
