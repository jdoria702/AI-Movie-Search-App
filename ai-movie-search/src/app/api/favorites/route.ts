// src/app/api/favorites/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMongoClient } from "@/lib/mongodb";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await getMongoClient();
  const db = client.db("sample_mflix");

  const favorites = await db
    .collection("favorites")
    .find({ userEmail: session.user.email })
    .sort({ createdAt: -1 })
    .toArray();

  return Response.json({
    favorites: favorites.map((favorite) => ({
      id: favorite._id.toString(),
      movieId: favorite.movieId,
      title: favorite.title,
      plot: favorite.plot,
      poster: favorite.poster,
      year: favorite.year,
      createdAt: favorite.createdAt,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const movie = await req.json();

  if (!movie.movieId || !movie.title) {
    return Response.json(
      { error: "movieId and title are required" },
      { status: 400 }
    );
  }

  const client = await getMongoClient();
  const db = client.db("sample_mflix");

  await db.collection("favorites").updateOne(
    {
      userEmail: session.user.email,
      movieId: movie.movieId,
    },
    {
      $set: {
        userEmail: session.user.email,
        movieId: movie.movieId,
        title: movie.title,
        plot: movie.plot ?? "",
        poster: movie.poster ?? "",
        year: movie.year ?? null,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  return Response.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { movieId } = await req.json();

  if (!movieId) {
    return Response.json(
      { error: "movieId is required" },
      { status: 400 }
    );
  }

  const client = await getMongoClient();
  const db = client.db("sample_mflix");

  await db.collection("favorites").deleteOne({
    userEmail: session.user.email,
    movieId: String(movieId),
  });

  return Response.json({ success: true });
}