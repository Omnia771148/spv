import { NextResponse } from "next/server";
import connectionToDatabase from "lib/mongoose";
import User from "../../../../../models/User";

// Helper to merge legacy address into the addresses list
function getMergedAddresses(user) {
    let addresses = user.savedAddresses ? JSON.parse(JSON.stringify(user.savedAddresses)) : [];

    // If legacy address exists and isn't represented in the array, add it
    if (user.savedAddress && user.savedAddress.flatNo) {
        const legacyExists = addresses.some(a =>
            a.flatNo === user.savedAddress.flatNo &&
            a.street === user.savedAddress.street
        );

        if (!legacyExists) {
            addresses = [
                {
                    ...(user.savedAddress.toObject ? user.savedAddress.toObject() : user.savedAddress),
                    label: user.savedAddress.label || "Recent",
                    _id: "legacy"
                },
                ...addresses
            ];
        }
    }
    return addresses;
}

export async function POST(request) {
    try {
        await connectionToDatabase();
        const { userId, address } = await request.json();

        console.log("📍 DEBUG: POST Request to save address");
        console.log("   User ID:", userId);
        console.log("   Address Data:", address);

        if (!userId || !address) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // 1. Fetch the user document
        const user = await User.findById(userId);
        if (!user) {
            console.error("❌ User not found in DB for ID:", userId);
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        console.log("✅ User found:", user.name);

        // 2. Ensure savedAddresses is an array
        if (!Array.isArray(user.savedAddresses)) {
            user.savedAddresses = [];
        }

        // 3. Add the new address
        // We'll also update the legacy singular field to match for backwards compatibility 
        // IF it's the first one or being manually saved.
        user.savedAddress = address;
        user.savedAddresses.push(address);

        // 4. Save using the instance method which is more reliable for schema enforcement
        await user.save();

        console.log("🚀 Address POSITIVELY saved to both savedAddress and savedAddresses array!");
        const finalAddresses = getMergedAddresses(user);

        return NextResponse.json({
            success: true,
            message: "Address saved successfully",
            addresses: finalAddresses
        }, { status: 200 });

    } catch (err) {
        console.error("🔥 Error in POST /api/users/address:", err);
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        await connectionToDatabase();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const addressId = searchParams.get('addressId');

        if (!userId || !addressId) {
            return NextResponse.json({ success: false, message: "Missing params" }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

        // Remove from array
        user.savedAddresses = user.savedAddresses.filter(a => a._id.toString() !== addressId);
        await user.save();

        return NextResponse.json({ success: true, addresses: getMergedAddresses(user) }, { status: 200 });
    } catch (err) {
        console.error("Error deleting address:", err);
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        await connectionToDatabase();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, addresses: getMergedAddresses(user) }, { status: 200 });

    } catch (err) {
        console.error("Error fetching addresses:", err);
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}
