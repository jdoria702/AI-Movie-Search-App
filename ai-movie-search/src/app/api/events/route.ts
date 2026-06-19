import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMongoClient } from "@/lib/mongodb";
import type { UserEventType } from "@/lib/userEvents";

const allowedEventTypes: UserEventType[] = [
  "search",
  "movie_click",
  "favorite_add",
  "favorite_remove",
];

// Insert a user event into the user_event collection
// Must have a valid event type: search, movie_click, favorite_add
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const type = body?.type as UserEventType | undefined;
  const movieId = body?.movieId ? String(body.movieId) : undefined;
  const query = body?.query ? String(body.query) : undefined;

  if (!type || !allowedEventTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  if (type === "search" && !query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  if (type !== "search" && !movieId) {
    return NextResponse.json({ error: "movieId is required" }, { status: 400 });
  }

  const client = await getMongoClient();
  const db = client.db("sample_mflix");

  const result = await db.collection("user_events").insertOne({
    userEmail: session.user.email,
    type,
    movieId: movieId ?? null,
    query: query ?? null,
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true, id: result.insertedId.toString() });
}

// Delete a user event from the user_event collection by its id
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const eventId = body?.eventId ? String(body.eventId) : "";

  if (!ObjectId.isValid(eventId)) {
    return NextResponse.json({ error: "eventId is required" }, { status: 400 });
  }

  const client = await getMongoClient();
  const db = client.db("sample_mflix");

  const result = await db.collection("user_events").deleteOne({
    _id: new ObjectId(eventId),
    userEmail: session.user.email,
  });

  return NextResponse.json({ success: result.deletedCount === 1 });
}