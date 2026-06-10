// src/app/favorites/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMongoClient } from "@/lib/mongodb";

type FavoriteMovie = {
  _id: string;
  movieId: string;
  title: string;
  plot?: string;
  poster?: string;
  year?: number;
  createdAt: Date;
};

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  const client = await getMongoClient();
  const db = client.db("sample_mflix");

  const favorites = await db
    .collection("favorites")
    .find({ userEmail: session.user.email })
    .sort({ createdAt: -1 })
    .toArray();

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Your Favorites</h1>

      {favorites.length === 0 ? (
        <p>You have no favorite movies yet.</p>
      ) : (
        <div className="grid gap-4">
          {favorites.map((movie: any) => (
            <div key={movie._id.toString()} className="border rounded p-4">
              <h2 className="text-xl font-semibold">{movie.title}</h2>
              {movie.year && <p>{movie.year}</p>}
              {movie.plot && <p>{movie.plot}</p>}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}