import type { MoodProfile, Movie } from "./types";
import { MOOD_GENRE_MAP } from "./types";
import { discoverMovies, searchMovies } from "./movies";
import { apiFetch } from "./http";

interface AiRecommendation {
  titles: string[];
  reasoning: string;
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("Gemini API key not configured");
  }

  const res = await apiFetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "your_groq_api_key_here") {
    throw new Error("Groq API key not configured");
  }

  const res = await apiFetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callAi(prompt: string): Promise<string> {
  const provider = process.env.AI_PROVIDER || "gemini";

  if (provider === "groq") return callGroq(prompt);
  if (provider === "gemini") return callGemini(prompt);
  throw new Error("No AI provider configured");
}

function buildRecommendationPrompt(userMessage: string, context?: string): string {
  return `You are RecommendME, a friendly movie recommendation expert. Help users pick movies when they're eating, hanging out, or just can't decide what to watch.

User message: "${userMessage}"
${context ? `User taste profile: ${context}` : ""}

Respond with valid JSON only (no markdown):
{
  "titles": ["Movie Title 1", "Movie Title 2", "Movie Title 3"],
  "reasoning": "A warm, conversational 2-3 sentence explanation of why these movies fit. Be enthusiastic but concise."
}

Rules:
- Suggest 3-5 real, well-known movies
- Match the user's mood, occasion, and preferences
- NEVER suggest movies the user already watched, saved, or disliked (see taste profile)
- Avoid genres the user dislikes or rates poorly
- Include variety (different eras/styles when appropriate)
- If they mention food (pizza, dinner, etc.), suggest movies that pair well with that vibe
- Only output the JSON object, nothing else`;
}

function buildMoodPrompt(profile: MoodProfile): string {
  return `Recommend movies for someone who is:
- Mood: ${profile.mood}
- Occasion: ${profile.occasion}
- Watching with: ${profile.company}
- Preferred length: ${profile.duration}
${profile.genres.length ? `- Liked genres: ${profile.genres.join(", ")}` : ""}

Respond with valid JSON only:
{
  "titles": ["Movie 1", "Movie 2", "Movie 3", "Movie 4", "Movie 5"],
  "reasoning": "Why these movies are perfect for this moment."
}`;
}

function parseAiResponse(text: string): AiRecommendation {
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Failed to parse AI response");
  }
}

async function resolveTitlesToMovies(
  titles: string[],
  excludeIds?: string[]
): Promise<Movie[]> {
  const movies: Movie[] = [];
  const seen = new Set<string>();
  const excluded = new Set(excludeIds || []);

  for (const title of titles.slice(0, 8)) {
    try {
      const results = await searchMovies(title, 1);
      const match = results.find(
        (m) =>
          !excluded.has(m.id) &&
          (m.title.toLowerCase().includes(title.toLowerCase().split(" ")[0]) || m.title === title)
      ) || results.find((m) => !excluded.has(m.id));

      if (match && !seen.has(match.id)) {
        seen.add(match.id);
        movies.push(match);
      }
    } catch {
      // skip failed lookups
    }
  }

  return movies.slice(0, 5);
}

export async function getAiRecommendations(
  userMessage: string,
  context?: string,
  excludeIds?: string[]
): Promise<{ movies: Movie[]; reasoning: string }> {
  try {
    const response = await callAi(buildRecommendationPrompt(userMessage, context));
    const parsed = parseAiResponse(response);
    const movies = await resolveTitlesToMovies(parsed.titles, excludeIds);
    if (movies.length > 0) {
      return { movies, reasoning: parsed.reasoning };
    }
  } catch {
    // fall through
  }
  return getFallbackRecommendations(userMessage, excludeIds);
}

export async function getMoodRecommendations(
  profile: MoodProfile
): Promise<{ movies: Movie[]; reasoning: string }> {
  const genreIds = profile.genres.length
    ? profile.genres
    : MOOD_GENRE_MAP[profile.mood] || [];

  const runtimeMap: Record<string, { min?: number; max?: number }> = {
    short: { max: 90 },
    medium: { min: 90, max: 120 },
    long: { min: 120 },
    any: {},
  };
  const runtime = runtimeMap[profile.duration] || {};

  try {
    const response = await callAi(buildMoodPrompt(profile));
    const parsed = parseAiResponse(response);
    const movies = await resolveTitlesToMovies(parsed.titles, undefined);

    if (movies.length >= 3) {
      return { movies, reasoning: parsed.reasoning };
    }
  } catch {
    // fall through to TMDB
  }

  const tmdbMovies = await discoverMovies({
    genres: genreIds.length ? genreIds : undefined,
    mood: profile.mood,
    minRuntime: runtime.min,
    maxRuntime: runtime.max,
    page: Math.floor(Math.random() * 3) + 1,
  });

  const reasoning = `Based on your ${profile.mood} mood during ${profile.occasion}, here are some great picks for watching ${profile.company === "alone" ? "solo" : "together"}!`;

  return { movies: tmdbMovies.slice(0, 5), reasoning };
}

async function getFallbackRecommendations(
  userMessage: string,
  excludeIds?: string[]
): Promise<{ movies: Movie[]; reasoning: string }> {
  const moodKeywords: Record<string, number[]> = {
    scary: [27, 53],
    horror: [27],
    funny: [35],
    comedy: [35],
    romantic: [10749],
    romance: [10749],
    action: [28],
    sci: [878],
    thriller: [53],
    drama: [18],
    family: [10751],
    animated: [16],
  };

  let genres: number[] = [];
  const lower = userMessage.toLowerCase();
  for (const [keyword, ids] of Object.entries(moodKeywords)) {
    if (lower.includes(keyword)) genres = [...genres, ...ids];
  }

  const movies = await discoverMovies({
    genres: genres.length ? [...new Set(genres)] : undefined,
    mood: Object.entries(moodKeywords).find(([k]) => lower.includes(k))?.[0],
    page: Math.floor(Math.random() * 5) + 1,
  });

  const excluded = new Set(excludeIds || []);
  const filtered = movies.filter((m) => !excluded.has(m.id));

  return {
    movies: filtered.slice(0, 5),
    reasoning:
      "Here are some popular picks based on what you described! (Tip: Add a free Gemini or Groq API key for smarter AI recommendations.)",
  };
}

export function isAiConfigured(): boolean {
  const provider = process.env.AI_PROVIDER || "gemini";
  if (provider === "none") return false;
  if (provider === "gemini") {
    const key = process.env.GEMINI_API_KEY;
    return Boolean(key && key !== "your_gemini_api_key_here");
  }
  if (provider === "groq") {
    const key = process.env.GROQ_API_KEY;
    return Boolean(key && key !== "your_groq_api_key_here");
  }
  return false;
}
