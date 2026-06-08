// src/lib/embeddings.ts
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

// Pass user text into embedding model, which returns an array of numbers representing the embedding
export async function createEmbedding(text: string): Promise<number[]> {
  const result = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text
  })

  const embedding = result.embeddings?.[0]?.values;

  if (!embedding) {
    throw new Error("Failed to create embedding");
  }

  return embedding;
}