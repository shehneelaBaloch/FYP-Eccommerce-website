// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/dbConnect";
import Profile from "@/lib/model/Profile";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { id?: string; email?: string | null };
    
    if (!user.id && !user.email) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    await connectDB();
    
    const profile = await Profile.findOne({ 
      userId: user.id || user.email 
    });

    // Return the actual profile data if found
    if (profile) {
      return NextResponse.json({
        phone: profile.phone || "",
        imageUrl: profile.imageUrl || "",
        addresses: profile.addresses || []
      });
    }

    // Return empty profile structure if no profile found
    return NextResponse.json({
      phone: "",
      imageUrl: "",
      addresses: []
    });

  } catch (error: any) {
    console.error("Profile GET Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { id?: string; email?: string | null };
    
    if (!user.id && !user.email) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const body = await req.json();
    const { phone, addresses, imageUrl } = body;

    await connectDB();

    const profile = await Profile.findOneAndUpdate(
      { userId: user.id || user.email },
      { 
        phone: phone || "",
        imageUrl: imageUrl || "",
        addresses: addresses || []
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    );

    return NextResponse.json({
      success: true,
      profile: {
        phone: profile.phone,
        imageUrl: profile.imageUrl,
        addresses: profile.addresses
      }
    });

  } catch (error: any) {
    console.error("Profile POST Error:", error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Profile already exists for this user" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}