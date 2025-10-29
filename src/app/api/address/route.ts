// /api/address/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/dbConnect";
import Profile from "@/lib/model/Profile";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = session.user as { id?: string; email?: string | null };
    const userId = user.id || user.email;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      // Return empty addresses if no profile exists
      return NextResponse.json({
        success: true,
        addresses: [],
      });
    }

    return NextResponse.json({
      success: true,
      addresses: profile.addresses || [],
    });
  } catch (err: any) {
    console.error("Get addresses error:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = session.user as { id?: string; email?: string | null };
    const userId = user.id || user.email;
    const { address } = await req.json();

    if (!userId || !address) {
      return NextResponse.json(
        { success: false, message: "User ID and address are required" },
        { status: 400 }
      );
    }

    await connectDB();

    let profile = await Profile.findOne({ userId });
    
    if (!profile) {
      // Create new profile if it doesn't exist
      profile = new Profile({ 
        userId, 
        addresses: [] 
      });
    }

    // Initialize addresses array if it doesn't exist
    if (!profile.addresses) {
      profile.addresses = [];
    }

    // If this is set as default, remove default from other addresses
    if (address.isDefault) {
      profile.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    // Add new address
    profile.addresses.push(address);
    await profile.save();

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      addresses: profile.addresses,
    });
  } catch (err: any) {
    console.error("Add address error:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = session.user as { id?: string; email?: string | null };
    const userId = user.id || user.email;
    const { addressIndex, address } = await req.json();

    if (!userId || addressIndex === undefined || !address) {
      return NextResponse.json(
        { success: false, message: "User ID, address index, and address are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      );
    }

    // Check if address index is valid
    if (!profile.addresses || addressIndex >= profile.addresses.length) {
      return NextResponse.json(
        { success: false, message: "Invalid address index" },
        { status: 400 }
      );
    }

    // If this is set as default, remove default from other addresses
    if (address.isDefault) {
      profile.addresses.forEach((addr: any, index: number) => {
        if (index !== addressIndex) {
          addr.isDefault = false;
        }
      });
    }

    // Update the address
    profile.addresses[addressIndex] = address;
    await profile.save();

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      addresses: profile.addresses,
    });
  } catch (err: any) {
    console.error("Update address error:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = session.user as { id?: string; email?: string | null };
    const userId = user.id || user.email;

    const { searchParams } = new URL(req.url);
    const addressIndex = searchParams.get("addressIndex");

    if (!userId || !addressIndex) {
      return NextResponse.json(
        { success: false, message: "User ID and address index are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      );
    }

    const index = parseInt(addressIndex);
    
    // Check if address index is valid
    if (!profile.addresses || index >= profile.addresses.length) {
      return NextResponse.json(
        { success: false, message: "Invalid address index" },
        { status: 400 }
      );
    }

    // Remove the address
    profile.addresses.splice(index, 1);
    await profile.save();

    return NextResponse.json({
      success: true,
      message: "Address removed successfully",
      addresses: profile.addresses,
    });
  } catch (err: any) {
    console.error("Delete address error:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}