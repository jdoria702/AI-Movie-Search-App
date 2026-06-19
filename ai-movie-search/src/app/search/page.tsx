// src/app/search/page.tsx

// Mark this file as a client component
'use client';

// Use the useState hook to store and remember data
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import MovieCard, { type Movie } from "@/components/MovieCard";
import { trackUserEvent } from "@/lib/userEvents";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [movies, setMovies] = useState<Movie[]>([]);
    const [favoriteMovieIds, setFavoriteMovieIds] = useState<Set<string>>(new Set());

    // Handle the search functionality and return the results
    async function handleSearch() {
        console.log("Searching for:", query);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        console.log("Response status:", res.status);
        const data: { results: Movie[] } = await res.json();
        console.log(data.results);
        setMovies(data.results);

        await trackUserEvent({
            type: "search",
            query,
        });
    }

    useEffect(() => {
        async function loadFavorites() {
            const res = await fetch("/api/favorites");

            if (!res.ok) return;

            const data: { favorites: Array<{ movieId: string }> } = await res.json();

            setFavoriteMovieIds(
                new Set(data.favorites.map((favorite) => String(favorite.movieId)))
            );
        }

        loadFavorites();
    }, []);

    async function toggleFavorite(movie: Movie) {
        const movieId = String(movie._id);
        const isFavorited = favoriteMovieIds.has(movieId);
        const eventType = isFavorited ? "favorite_remove" : "favorite_add";

        const res = await fetch("/api/favorites", {
            method: isFavorited ? "DELETE" : "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            movieId,
            title: movie.title,
            plot: movie.plot,
            poster: movie.poster,
            year: movie.year,
            }),
        });

        if (!res.ok) {
            alert("Please sign in first.");
            return;
        }

        setFavoriteMovieIds((prev) => {
            const next = new Set(prev);

            if (isFavorited) {
            next.delete(movieId);
            } else {
            next.add(movieId);
            }

            return next;
        });

        await trackUserEvent({
            type: eventType,
            movieId,
        });
        }

    function handleMovieClick(movie: Movie) {
        void trackUserEvent({
            type: "movie_click",
            movieId: String(movie._id),
        });
    }

    return (
        <main className="max-w-3xl mx-auto p-6 space-y-4">
            <h1 className="text-3xl font-bold">AI Movie Search</h1>
            <AuthButton />
            <Link href="/favorites" className="text-blue-500 underline">
                View Favorites
            </Link>
            <div className="flex gap-2">
            <input
                className="border rounded px-3 py-2 w-full"
                placeholder="Search movies..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            <button
                onClick={handleSearch}
                className="bg-black text-white px-4 py-2 rounded"
            >
                Search
            </button>
            </div>

            <div className="space-y-3">
            {movies.map((movie) => (
                <MovieCard
                    key={movie._id}
                    movie={movie}
                    isFavorited={favoriteMovieIds.has(String(movie._id))}
                    onToggleFavorite={toggleFavorite}
                    onCardClick={handleMovieClick}
                />
            ))}
            </div>
        </main>
    );
}