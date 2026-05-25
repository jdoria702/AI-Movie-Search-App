// src/app/api/vector-search/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getMflixDb } from "@/lib/mongodb";
import { createEmbedding } from "@/lib/embeddings";

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  const embedding = await createEmbedding(query);

  const db = await getMflixDb();

  const movies = await db.collection("embedded_movies").aggregate([
    {
        $vectorSearch: {
            index: "vector_index",
            path: "plot_embedding",
            queryVector: embedding,
            numCandidates: 100,
            limit: 10,
        },
    },
    {
        $project: {
            title: 1,
            plot: 1,
            genres: 1,
            score: { $meta: "vectorSearchScore" },
        },
    },
  ]).toArray();

  return NextResponse.json({ movies })
}