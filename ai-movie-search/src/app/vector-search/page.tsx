// src/app/search/page.tsx

// Mark this file as a client component
'use client';

// Use the useState hook to store and remember data
import { useState } from "react";
import MovieCard, { type Movie } from "@/components/MovieCard";
import { trackUserEvent } from "@/lib/userEvents";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [movies, setMovies] = useState<Movie[]>([]);

    // Handle the search functionality and return the results
    async function handleSearch() {
        const res = await fetch(`/api/vector-search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // Equivanlent to: query: query, but since the key and value are the same, we can just write query
            body: JSON.stringify({ query }),
        });
        const data: { movies: Movie[] } = await res.json();
        console.log(data.movies);
        setMovies(data.movies);

        await trackUserEvent({
            type: "search",
            query,
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
            <h1 className="text-3xl font-bold">AI Movie Vector Search</h1>

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
                    onCardClick={handleMovieClick}
                />
            ))}
            </div>
        </main>
    );
}