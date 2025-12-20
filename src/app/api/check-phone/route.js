import { NextResponse } from "next/server";
import User from "../../../../models/User";
import connectionToDatabase from "../../../../lib/mongoose";

export async function PATCH(request) {
  try {
    await connectionToDatabase();

    const body = await request.json();
    let { phone, email } = body;

    if (!phone || !email) {
      return NextResponse.json({ error: "Phone and email are required" }, { status: 400 });
    }

    phone = phone.trim();
    if (!phone.startsWith("+91")) {
      phone = "+91" + phone;
    }

    // Check if user exists
    const user = await User.findOne({ phone });

    if (!user) {
      return NextResponse.json({ exists: false, message: "User not found" }, { status: 404 });
    }

    // Patch the email
    user.email = email.trim();
    await user.save();

    return NextResponse.json({ exists: true, message: "Email updated successfully", user }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
