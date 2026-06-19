"use client";

export type Movie = {
  _id: string;
  title: string;
  plot?: string;
  poster?: string;
  year?: number;
};

type MovieCardProps = {
  movie: Movie;
  isFavorited?: boolean;
  onToggleFavorite?: (movie: Movie) => void;
  onCardClick?: (movie: Movie) => void;
};

export default function MovieCard({
  movie,
  isFavorited,
  onToggleFavorite,
  onCardClick,
}: MovieCardProps) {
  return (
    <div
      className={`border rounded p-4 space-y-2 ${
        onCardClick ? "cursor-pointer hover:border-gray-400" : ""
      }`}
      onClick={() => onCardClick?.(movie)}
      role={onCardClick ? "button" : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (!onCardClick) return;

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onCardClick(movie);
        }
      }}
    >
      <div className="flex justify-between gap-4">
        <div>
          <h2 className="font-semibold">{movie.title}</h2>
          {movie.year && <p className="text-sm text-gray-500">{movie.year}</p>}
        </div>

        {onToggleFavorite && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(movie);
            }}
            className="text-2xl"
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorited ? "❤️" : "♡"}
          </button>
        )}
      </div>

      {movie.poster && (
        <img
          src={movie.poster}
          alt={`${movie.title} poster`}
          className="w-32 rounded"
        />
      )}

      <p className="text-sm text-gray-600">{movie.plot}</p>
    </div>
  );
}