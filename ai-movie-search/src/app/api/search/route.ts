// src/app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMflixDb } from "@/lib/mongodb";
import { hybridMovieSearch } from "@/lib/search/hybridSearch";

// Hybrid search: combine atlas search with vector search
export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get("q") ?? "";

    if (!query || typeof query !== "string") {
        return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const results = await hybridMovieSearch(query);
    console.log(results);

    // returns JSON with a "results" property containing the search results, and a status code of 200 (OK)
    return NextResponse.json({ results });
}

// weak regex search
// export async function GET(req: NextRequest) {
//     // Get the "q" query parameter from the request URL
//     // Default to empty string if "q" is not provided
//     const query = req.nextUrl.searchParams.get("q") ?? "";

//     // Get the MongoDB database and connects if needed
//     const db = await getMflixDb();

//     // Queries the 'movies' collectiono for titles matching the query (case-insensitive)
//     const movies = await db
//         .collection("movies")
//         .find({
//             title: { $regex: query, $options: "i" },
//         })
//         .limit(10)
//         .toArray();


//     // Return the movies as a JSON response
//     return NextResponse.json({ movies });
// }

// Atlas search: advanced search experiences like autocomplete and typo-tolerance
// export async function GET (req: NextRequest) {
//     const query = req.nextUrl.searchParams.get("q") ?? "";
//     const db = await getMflixDb();

//     const movies = await db
//         .collection("movies")
//         .aggregate([
//             {
//                 $search: {
//                     index: "default",
//                     text: {
//                         query,
//                         path: ["title", "plot", "genres"],
//                         fuzzy:  {},
//                     },
//                 },
//             },
//             {
//                 $limit: 10,
//             },
//             {
//                 $project: {
//                     title: 1,
//                     plot: 1,
//                     genres: 1,
//                     year: 1,
//                     score: { $meta: "searchScore" },
//                 }
//             }
//         ]).toArray();

//         return NextResponse.json({ movies });
// }