import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateAndStoreRecommendations } from "@/lib/recommendations";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recommendations = await generateAndStoreRecommendations(session.user.email);

  return NextResponse.json({ recommendations });
}