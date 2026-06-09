// src/app/search/page.tsx

// Mark this file as a client component
'use client';

// Use the useState hook to store and remember data
import { useState } from "react";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [movies, setMovies] = useState<any[]>([]); // typed as any[] (an array of anything) initializes it to an empty array

    // Handle the search functionality and return the results
    async function handleSearch() {
        console.log("Searching for:", query);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        console.log("Response status:", res.status);
        const data = await res.json();
        console.log(data.results);
        setMovies(data.results);
    }


    return (
        <main className="max-w-3xl mx-auto p-6 space-y-4">
            <h1 className="text-3xl font-bold">AI Movie Search</h1>

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
                <div key={movie._id} className="border rounded p-4">
                <h2 className="font-semibold">{movie.title}</h2>
                <p className="text-sm text-gray-600">{movie.plot}</p>
                </div>
            ))}
            </div>
        </main>
    );
}