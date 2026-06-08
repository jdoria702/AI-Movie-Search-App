// src/app/api/vector-search/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getMflixDb } from "@/lib/mongodb";
import { createEmbedding } from "@/lib/embeddings";

export async function POST(req: NextRequest) {
  // destructure the body of the request and get the query property from it
  /*
      Equivalent to the code:

      const body = await req.json();
      const query = body.query;
  */
  const { query } = await req.json();

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const embedding = await createEmbedding(query);

  console.log("query:", query);
  console.log("embedding length:", embedding.length);
  console.log("first 5 values:", embedding.slice(0, 5));

  const db = await getMflixDb();

  const sample = await db.collection("embedded_movies").findOne(
    { plot_embedding_voyage_3_large: { $exists: true } },
    { projection: { title: 1, plot_embedding_voyage_3_large: 1 } }
  );

  console.log("sample title:", sample?.title);
  console.log("stored embedding length:", sample?.plot_embedding_voyage_3_large?.length);

  const movies = await db.collection("embedded_movies").aggregate([
    {
        $vectorSearch: {
        index: "voyage_vector_index",
        path: "plot_embedding_voyage_3_large",
        queryVector: embedding,
        numCandidates: 100,
        limit: 10,
        }
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