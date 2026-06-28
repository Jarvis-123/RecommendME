import { NextRequest, NextResponse } from "next/server";
import { searchMovies, isMovieDataConfigured } from "@/lib/movies";

export async function GET(request: NextRequest) {
  if (!isMovieDataConfigured()) {
    return NextResponse.json({ error: "No movie data API configured. See .env.example" }, { status: 503 });
  }

  const query = request.nextUrl.searchParams.get("q");
  const page = request.nextUrl.searchParams.get("page") || "1";
  const year = request.nextUrl.searchParams.get("year") || undefined;

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  try {
    const movies = await searchMovies(query, parseInt(page), year);
    return NextResponse.json({ movies });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    );
  }
}
