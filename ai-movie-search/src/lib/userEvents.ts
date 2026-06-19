export type UserEventType =
  | "search"
  | "movie_click"
  | "favorite_add"
  | "favorite_remove";

type TrackUserEventInput = {
  type: UserEventType;
  movieId?: string;
  query?: string;
};

export async function trackUserEvent(input: TrackUserEventInput): Promise<void> {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
  } catch {
    // Event tracking must never block the user flow.
  }
}