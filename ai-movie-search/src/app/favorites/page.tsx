// src/app/favorites/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMongoClient } from "@/lib/mongodb";
import FavoritesList from "./FavoritesList";

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
      <p><a href="/" className="text-blue-500 hover:underline">
        &larr; Back to Home
      </a></p>
      <FavoritesList favorites={favorites} />
    </main>
  );
}