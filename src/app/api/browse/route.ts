import { NextResponse } from "next/server";
import { getBrowseData, isMovieDataConfigured } from "@/lib/movies";

export async function GET() {
  if (!isMovieDataConfigured()) {
    return NextResponse.json({ error: "No movie data API configured. See .env.example" }, { status: 503 });
  }

  try {
    const data = await getBrowseData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch browse data" },
      { status: 500 }
    );
  }
}
