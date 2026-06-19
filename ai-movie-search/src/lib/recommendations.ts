import { ObjectId } from "mongodb";
import { getMflixDb } from "@/lib/mongodb";

export type RecommendedMovie = {
  _id: string;
  title: string;
  plot?: string;
  poster?: string;
  year?: number;
  genres?: string[];
  score: number;
  reason: string;
  generatedAt: string;
};

type MovieDocument = {
  _id: ObjectId | string;
  title?: string;
  plot?: string;
  poster?: string;
  year?: number;
  genres?: string[];
};

function normalizeGenres(genres: unknown): string[] {
  if (!Array.isArray(genres)) {
    return [];
  }

  return genres
    .map((genre) => String(genre).trim())
    .filter((genre) => genre.length > 0);
}

function stringifyId(id: ObjectId | string): string {
  return typeof id === "string" ? id : id.toString();
}

function buildIdFilter(ids: string[]) {
  const objectIds = ids.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
  const stringIds = ids.filter((id) => !ObjectId.isValid(id));

  const clauses = [];

  if (objectIds.length > 0) {
    clauses.push({ _id: { $in: objectIds } });
  }

  if (stringIds.length > 0) {
    clauses.push({ _id: { $in: stringIds } });
  }

  if (clauses.length === 0) {
    return null;
  }

  if (clauses.length === 1) {
    return clauses[0];
  }

  return { $or: clauses };
}

async function loadMoviesByIds(
  collectionName: string,
  ids: string[]
): Promise<MovieDocument[]> {
  const db = await getMflixDb();
  const filter = buildIdFilter(ids);

  if (!filter) {
    return [];
  }

  return db.collection(collectionName).find(filter, {
    projection: {
      title: 1,
      plot: 1,
      poster: 1,
      year: 1,
      genres: 1,
    },
  }).toArray() as Promise<MovieDocument[]>;
}

async function loadMoviesByGenres(
  collectionName: string,
  genres: string[]
): Promise<MovieDocument[]> {
  if (genres.length === 0) {
    return [];
  }

  const db = await getMflixDb();

  return db.collection(collectionName).find(
    { genres: { $in: genres } },
    {
      projection: {
        title: 1,
        plot: 1,
        poster: 1,
        year: 1,
        genres: 1,
      },
    }
  ).limit(200).toArray() as Promise<MovieDocument[]>;
}

function dedupeMovies(movies: MovieDocument[]): MovieDocument[] {
  const merged = new Map<string, MovieDocument>();

  for (const movie of movies) {
    merged.set(stringifyId(movie._id), movie);
  }

  return Array.from(merged.values());
}

export async function generateAndStoreRecommendations(userId: string): Promise<RecommendedMovie[]> {
  const db = await getMflixDb();

  const [favoriteDocs, clickDocs] = await Promise.all([
    db.collection("favorites")
      .find({ userEmail: userId }, { projection: { movieId: 1 } })
      .toArray(),
    db.collection("user_events")
      .find({ userEmail: userId, type: "movie_click" }, { projection: { movieId: 1 } })
      .toArray(),
  ]);

  const historyMovieIds = Array.from(
    new Set(
      [...favoriteDocs, ...clickDocs]
        .map((doc) => String(doc.movieId ?? ""))
        .filter((movieId) => movieId.length > 0)
    )
  );

  await db.collection("precomputed_recommendations").deleteMany({ userId });

  if (historyMovieIds.length === 0) {
    return [];
  }

  const historyMovies = await loadMoviesByIds("movies", historyMovieIds);

  const historyGenreCounts = new Map<string, number>();

  for (const movie of dedupeMovies(historyMovies)) {
    for (const genre of normalizeGenres(movie.genres)) {
      historyGenreCounts.set(genre, (historyGenreCounts.get(genre) ?? 0) + 1);
    }
  }

  const topGenres = Array.from(historyGenreCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([genre]) => genre);

  if (topGenres.length === 0) {
    return [];
  }

  const [movieCandidates, embeddedCandidates] = await Promise.all([
    loadMoviesByGenres("movies", topGenres),
    loadMoviesByGenres("embedded_movies", topGenres),
  ]);

  const excludedMovieIds = new Set(historyMovieIds);
  const candidateMovies = dedupeMovies([...movieCandidates, ...embeddedCandidates]).filter(
    (movie) => !excludedMovieIds.has(stringifyId(movie._id))
  );

  const rankedRecommendations = candidateMovies
    .map((movie) => {
      const movieGenres = normalizeGenres(movie.genres);
      const matchedGenres = topGenres.filter((genre) => movieGenres.includes(genre));

      if (matchedGenres.length === 0) {
        return null;
      }

      const score = matchedGenres.reduce(
        (total, genre) => total + (historyGenreCounts.get(genre) ?? 0),
        0
      );

      return {
        movie,
        score,
        reason: `Matches your frequent genres: ${matchedGenres.join(", ")}`,
      };
    })
    .filter((item): item is { movie: MovieDocument; score: number; reason: string } => item !== null)
    .sort((left, right) => right.score - left.score)
    .slice(0, 10);

  if (rankedRecommendations.length === 0) {
    return [];
  }

  const generatedAt = new Date();
  const documents = rankedRecommendations.map((item) => ({
    userId,
    movieId: stringifyId(item.movie._id),
    score: item.score,
    reason: item.reason,
    generatedAt,
  }));

  await db.collection("precomputed_recommendations").insertMany(documents);

  return rankedRecommendations.map((item) => ({
    _id: stringifyId(item.movie._id),
    title: item.movie.title ?? "Untitled movie",
    plot: item.movie.plot,
    poster: item.movie.poster,
    year: item.movie.year,
    genres: normalizeGenres(item.movie.genres),
    score: item.score,
    reason: item.reason,
    generatedAt: generatedAt.toISOString(),
  }));
}
