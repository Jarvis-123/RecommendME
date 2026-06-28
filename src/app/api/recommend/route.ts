import { NextRequest, NextResponse } from "next/server";
import { getAiRecommendations, getMoodRecommendations } from "@/lib/ai";
import type { MoodProfile } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const excludeIds: string[] = body.excludeIds || [];
    const tasteContext: string = body.tasteContext || "";

    if (body.type === "mood") {
      const profile = body.profile as MoodProfile;
      const result = await getMoodRecommendations(profile);
      const movies = result.movies.filter((m) => !excludeIds.includes(m.id));
      return NextResponse.json({ ...result, movies });
    }

    const { message, context } = body;
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const fullContext = [tasteContext, context].filter(Boolean).join(". ");
    const result = await getAiRecommendations(message, fullContext || undefined, excludeIds);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Recommendation failed" },
      { status: 500 }
    );
  }
}
