import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../../lib/mongoose"; // adjust path to your db connection
import User from "../../../../../models/User";

export async function PUT(req, { params }) {
  try {
    await connectionToDatabase();
    const { id } = params;
    const { name, email } = await req.json();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}