import { getMflixDb } from "@/lib/mongodb";
import { createEmbedding } from "@/lib/embeddings";

export async function hybridMovieSearch(query: string) {
    const db = await getMflixDb();
    const movies_collection = db.collection("movies");
    const embedded_collection = db.collection("embedded_movies");

    const queryVector = await createEmbedding(query);

    // Vector search on the plot embeddings, which captures semantic similarity and can find relevant movies even if they don't share exact keywords with the query
    const vectorResults = await embedded_collection.aggregate([
        {
            $vectorSearch: {

                index: "voyage_vector_index",               // The name of the search index created in atlas search
                path: "plot_embedding_voyage_3_large",      // The field in the collection that contains the vector embeddings
                queryVector,                                // The vector embedding of the search query
                numCandidates: 100,
                limit: 10,
            },
        },
        {
            $project: {
                title: 1,
                plot: 1,
                year: 1,
                vectorScore: { $meta: "vectorSearchScore" },
            },
        },
    ]).toArray();

    // Atlas search autocomplete on title with fuzzy matching for typos, and combines results with vector search results
    const titleResults = await movies_collection.aggregate([
        {
            $search: {
                index: "default",
                autocomplete: {
                    query,
                    path: "title",
                    fuzzy: {
                        maxEdits: 1,
                        prefixLength: 2,
                    },
                },
            },
        },
        {
            $project: {
                title: 1,
                plot: 1,
                year: 1,
                titleSearchScore: { $meta: "searchScore" },
            },
        },
        { $limit: 10 },
    ]).toArray();

    // Merge vector-search results and title-search results.
    // the key is the movie _id
    const merged = new Map<string, any>();

    // first pass, add all vector search results to the map with their vector score and a default title score of 0
    for (const movie of vectorResults) {
        merged.set(movie._id.toString(), {
            ...movie,
            vectorScore: movie.vectorScore ?? 0,
            titleScore: 0,
        });
    }

    // second pass, for each title search result, if it's already in the map from the vector search, update its title score; if it's not in the map, add it with a default vector score of 0
    for (const movie of titleResults) {
        const id = movie._id.toString();

        merged.set(id, {
            ...merged.get(id),
            ...movie,
            vectorScore: merged.get(id)?.vectorScore ?? 0,
            titleScore: movie.titleSearchScore ?? 0,
        });
    }

    // Find the max vector score and max title score among the merged results for normalization
    const maxVectorScore = Math.max(
        ...Array.from(merged.values()).map((m) => m.vectorScore ?? 0),
        0
    );

    const maxTitleScore = Math.max(
        ...Array.from(merged.values()).map((m) => m.titleScore ?? 0),
        0
    );

    // rank the merged results by combining the weights and store as finalScore
    // 60% of weight to the title match
    // 40% to vector similarity
    const ranked = Array.from(merged.values())
        .map((movie) => ({
            ...movie,
            finalScore:
                normalize(movie.titleScore, maxTitleScore) * 0.6 +
                normalize(movie.vectorScore, maxVectorScore) * 0.4,
        }))
        .sort((a, b) => b.finalScore - a.finalScore)
        .slice(0, 10);

    return ranked;
}

// Normalize a score to a 0-1 range based on the maximum score in that category
function normalize(value: number, max: number) {
  if (!max) return 0;
  return value / max;
}