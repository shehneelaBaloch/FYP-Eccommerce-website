// app/api/upload/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import connectDB from "@/lib/dbConnect";
import Profile from "@/lib/model/Profile";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public/uploads/profiles');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `profile-${userId}-${timestamp}.${fileExtension}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Return the public URL
    const imageUrl = `/uploads/profiles/${filename}`;

    // ✅ Connect to database and save the image URL
    await connectDB();
    
    // Update profile with the new image URL
    const profile = await Profile.findOneAndUpdate(
      { userId: userId },
      { 
        imageUrl: imageUrl 
      },
      { 
        new: true, 
        upsert: true 
      }
    );

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      message: "Profile picture uploaded and saved successfully",
      profile: profile
    });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}