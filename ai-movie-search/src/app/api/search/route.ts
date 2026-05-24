// src/app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMflixDb } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
    // Get the "q" query parameter from the request URL
    // Default to empty string if "q" is not provided
    const query = req.nextUrl.searchParams.get("q") ?? "";

    // Get the MongoDB database and connects if needed
    const db = await getMflixDb();

    // Queries the 'movies' collectiono for titles matching the query (case-insensitive)
    const movies = await db
        .collection("movies")
        .find({
            title: { $regex: query, $options: "i" },
        })
        .limit(10)
        .toArray();


    // Return the movies as a JSON response
    return NextResponse.json({ movies });
}