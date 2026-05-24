// src/lib/mongodb.ts
import { Db, MongoClient } from "mongodb";


// Connect to MongoDB
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}

let client: MongoClient | null = null;
let connectPromise: Promise<MongoClient> | null = null;

// Returns a connected MongoDB client
export async function getMongoClient(): Promise<MongoClient> {
  if (client) return client;
  if (!connectPromise) {
    const c = new MongoClient(uri!);
    connectPromise = c.connect().then((connected) => {
      client = connected;
      return client;
    });
  }
  return connectPromise;
}

// Waits for a connected MongoDB client and returns the mflix database
export async function getMflixDb(): Promise<Db> {
  const c = await getMongoClient();
  return c.db("sample_mflix");
}

export async function closeMongoClient(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    connectPromise = null;
  }
}