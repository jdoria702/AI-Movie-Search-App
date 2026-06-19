import AuthButton from "@/components/AuthButton";
import MovieCard, { type Movie } from "@/components/MovieCard";
import { authOptions } from "@/lib/auth";
import { generateAndStoreRecommendations } from "@/lib/recommendations";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const recommendations = session?.user?.email
    ? await generateAndStoreRecommendations(session.user.email)
    : [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-100 via-white to-zinc-50">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 md:px-10">
        <div className="flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
              AI Movie Search
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-zinc-950 md:text-5xl">
              Personalized recommendations for the signed-in viewer.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-zinc-600">
              Your favorites and clicks are analyzed to precompute movie recommendations and save them for fast reuse.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/search"
              className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Search Movies
            </Link>
            <Link
              href="/favorites"
              className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-950"
            >
              Favorites
            </Link>
            <AuthButton />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-950">Recommended for you</h2>
              <p className="text-sm text-zinc-500">
                Based on your favorite and clicked movies.
              </p>
            </div>
            {session?.user?.email && (
              <p className="text-sm text-zinc-500">
                Signed in as {session.user.email}
              </p>
            )}
          </div>

          {!session?.user?.email ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-zinc-600">
              Sign in to generate and view recommendations.
            </div>
          ) : recommendations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-zinc-600">
              No recommendations yet. Favorite or click a few movies to build your profile.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {recommendations.map((recommendation) => (
                <div key={recommendation._id} className="space-y-2">
                  <MovieCard movie={recommendation as Movie} />
                  <div className="rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-600">
                    <span className="font-medium text-zinc-800">Score {recommendation.score}.</span>{" "}
                    {recommendation.reason}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
