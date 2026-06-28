import { NextResponse } from "next/server";
import { getGenres, isMovieDataConfigured } from "@/lib/movies";

export async function GET() {
  if (!isMovieDataConfigured()) {
    return NextResponse.json({ error: "No movie data API configured. See .env.example" }, { status: 503 });
  }
  try {
    const genres = await getGenres();
    return NextResponse.json({ genres });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch genres" },
      { status: 500 }
    );
  }
}
