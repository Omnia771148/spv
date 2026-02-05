import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/mongoose";
import User from "../../../../models/User";
import crypto from "crypto";

export async function POST(request) {
    try {
        await connectionToDatabase();
        const { phone, password } = await request.json();

        if (!phone || !password) {
            return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
        }

        const user = await User.findOne({ phone });

        if (!user) {
            return NextResponse.json({ error: "Invalid Mobile Number or Password" }, { status: 401 });
        }

        // 1. Check if password matches as plain text (Legacy support)
        if (user.password === password) {
            return NextResponse.json(user, { status: 200 });
        }

        // 2. Check if password matches as hash
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        if (user.password === hashedPassword) {
            return NextResponse.json(user, { status: 200 });
        }

        return NextResponse.json({ error: "Invalid Mobile Number or Password" }, { status: 401 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
