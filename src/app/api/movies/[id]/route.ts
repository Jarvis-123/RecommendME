import { NextRequest, NextResponse } from "next/server";
import { getMovieDetails, isMovieDataConfigured } from "@/lib/movies";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isMovieDataConfigured()) {
    return NextResponse.json({ error: "No movie data API configured. See .env.example" }, { status: 503 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  try {
    const movie = await getMovieDetails(id);
    return NextResponse.json({ movie });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch movie" },
      { status: 500 }
    );
  }
}
