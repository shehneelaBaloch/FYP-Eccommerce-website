import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/dbConnect";
import Profile from "@/lib/model/Profile";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ✅ Cast so we can access id
  const user = session.user as { id?: string; email?: string | null };

  await connectDB();
  const profile = await Profile.findOne({ userId: user.id || user.email });
  return NextResponse.json(profile || {});
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as { id?: string; email?: string | null };

  await connectDB();
  const body = await req.json();
  const { phone, address, imageUrl } = body;

  const profile = await Profile.findOneAndUpdate(
    { userId: user.id || user.email },
    { phone, address, imageUrl },
    { new: true, upsert: true }
  );

  return NextResponse.json(profile);
}
