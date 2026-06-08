// src/lib/embeddings.ts
import { GoogleGenAI } from "@google/genai";
import { VoyageAIClient } from "voyageai";

const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

// Pass user text into embedding model, which returns an array of numbers representing the embedding
// export async function createEmbedding(text: string): Promise<number[]> {
//   const result = await ai.models.embedContent({
//     model: "gemini-embedding-001",
//     contents: text
//   })

//   const embedding = result.embeddings?.[0]?.values;

//   if (!embedding) {
//     throw new Error("Failed to create embedding");
//   }

//   return embedding;
// }

// Voyage embedding example - not currently used in the app, but you can switch to using this instead of the Gemini embedding if you want to experiment with Voyage
export async function createEmbedding(text: string): Promise<number[]> {
  const result = await voyage.embed({
    input: [text],
    model: "voyage-3-large",
    outputDimension: 2048,
  });

  const embedding = result.data?.[0]?.embedding;

  if (!embedding) {
    throw new Error("Failed to create Voyage embedding");
  }

  return embedding;
}