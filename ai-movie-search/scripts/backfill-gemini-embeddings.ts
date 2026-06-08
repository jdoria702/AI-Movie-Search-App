import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";
import { GoogleGenAI } from "@google/genai";

const client = new MongoClient(process.env.MONGODB_URI!);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Call Gemini embedding model with the movie plot text to get back an array of numbers representing the embedding
async function createEmbedding(text: string): Promise<number[]> {
  const result = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
  });

  const values = result.embeddings?.[0]?.values;

  if (!values) {
    throw new Error("Failed to create Gemini embedding");
  }

  return values;
}

async function main() {
  await client.connect();

  const db = client.db("sample_mflix");
  const collection = db.collection("embedded_movies");

  // Iterate through movies that have a plot but no embedding yet
  const cursor = collection
    .find({
      plot: { $exists: true, $ne: "" },
      gemini_plot_embedding: { $exists: false },
    })
    .project({
      _id: 1,
      title: 1,
      plot: 1,
    })
    .limit(100); // start small first

  // for each movie, create an embedding from the movie's plot and set new field: gemini_plot_embedding
  for await (const movie of cursor) {
    const text = movie.plot as string;

    console.log(`Embedding: ${movie.title}`);

    const embedding = await createEmbedding(text);

    await collection.updateOne(
      { _id: movie._id as ObjectId },
      {
        $set: {
          gemini_plot_embedding: embedding,
          gemini_embedding_model: "gemini-embedding-001",
        },
      }
    );

    console.log(`Saved ${embedding.length} dimensions`);
  }

  await client.close();
}

main().catch(async (err) => {
  console.error(err);
  await client.close();
  process.exit(1);
});