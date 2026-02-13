import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectionToDatabase from "../../../../../lib/mongoose";
import OrderStatus from "../../../../../models/OrderStatus";

export async function DELETE(request, { params }) {
    try {
        await connectionToDatabase();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { message: "Invalid order ID" },
                { status: 400 }
            );
        }

        const deletedOrder = await OrderStatus.findByIdAndDelete(id);

        if (!deletedOrder) {
            return NextResponse.json(
                { message: "Order not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Order deletion error:", error);
        return NextResponse.json(
            { message: "Failed to delete order" },
            { status: 500 }
        );
    }
}
