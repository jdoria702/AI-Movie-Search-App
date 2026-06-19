// src/app/favorites/FavoritesList.tsx
"use client";

import MovieCard, { type Movie } from "@/components/MovieCard";
import { trackUserEvent } from "@/lib/userEvents";

export default function FavoritesList({ favorites }: { favorites: Movie[] }) {
  async function toggleFavorite(movie: Movie) {
    await fetch("/api/favorites", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movieId: String(movie._id),
      }),
    });

    await trackUserEvent({
      type: "favorite_remove",
      movieId: String(movie._id),
    });

    window.location.reload();
  }

  if (favorites.length === 0) {
    return <p>You have no favorite movies yet.</p>;
  }

  return (
    <div className="grid gap-4">
      {favorites.map((movie) => (
        <MovieCard
          key={movie._id.toString()}
          movie={movie}
          isFavorited={true}
          onToggleFavorite={toggleFavorite}
          onCardClick={(selectedMovie) => {
            void trackUserEvent({
              type: "movie_click",
              movieId: String(selectedMovie._id),
            });
          }}
        />
      ))}
    </div>
  );
}