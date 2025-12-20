import { NextResponse } from "next/server";
import connectionToDatabase from "../../../../lib/mongoose";
import User from "../../../../models/User";



export async function POST(request) {
  try {
    await connectionToDatabase();
    const { name, email, phone } = await request.json();
    const newUser = new User({ name, email,phone });
    await newUser.save();

    return NextResponse.json(newUser, { status: 200 });

  
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }

}

export async function GET() {
  try {
    await connectionToDatabase();
    const users = await User.find();
    return NextResponse.json(users, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

