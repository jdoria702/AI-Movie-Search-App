type Movie = {
  _id: string;
  title: string;
  plot?: string;
  poster?: string;
  year?: number;
};

type MovieCardProps = {
  movie: Movie;
  isFavorited: boolean;
  onToggleFavorite: (movie: Movie) => void;
};

export default function MovieCard({
  movie,
  isFavorited,
  onToggleFavorite,
}: MovieCardProps) {
  return (
    <div className="border rounded p-4 space-y-2">
      <div className="flex justify-between gap-4">
        <div>
          <h2 className="font-semibold">{movie.title}</h2>
          {movie.year && <p className="text-sm text-gray-500">{movie.year}</p>}
        </div>

        <button
          onClick={() => onToggleFavorite(movie)}
          className="text-2xl"
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorited ? "❤️" : "♡"}
        </button>
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