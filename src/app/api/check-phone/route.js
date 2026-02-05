import { NextResponse } from "next/server";
import User from "../../../../models/User";
import connectionToDatabase from "../../../../lib/mongoose";

import crypto from "crypto";

export async function PATCH(request) {
  try {
    await connectionToDatabase();

    const body = await request.json();
    let { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json({ error: "Phone and password are required" }, { status: 400 });
    }

    // Ensure phone is 10 digits (matches DB)
    phone = phone.trim().replace(/^\+91/, '').replace(/\D/g, '');


    // Check if user exists
    const user = await User.findOne({ phone });

    if (!user) {
      return NextResponse.json({ exists: false, message: "User not found" }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Update the password
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ exists: true, message: "Password updated successfully", user }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
