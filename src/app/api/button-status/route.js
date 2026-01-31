import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/mongoose";
import ButtonStatus from "../../../../models/ButtonStatus";

export async function GET() {
    try {
        await connectionToDatabase();
        const statuses = await ButtonStatus.find({});
        return NextResponse.json(statuses, { status: 200 });
    } catch (error) {
        console.error("Error fetching button statuses:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
