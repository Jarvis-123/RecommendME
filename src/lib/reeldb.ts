import type { Genre, Movie, MovieDetail, StreamingProvider } from "./types";
import { apiFetch } from "./http";

const REELDB_BASE = "https://api.reeldb.io";

function getApiKey(): string {
  const key = process.env.REELDB_API_KEY;
  if (!key || key === "your_reeldb_api_key_here") {
    throw new Error("REELDB_API_KEY is not configured");
  }
  return key;
}

function getRegion(): string {
  return process.env.MOVIE_REGION || process.env.TMDB_REGION || "US";
}

async function reeldbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${REELDB_BASE}${path}`);
  url.searchParams.set("apikey", getApiKey());
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await apiFetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`ReelDB API error: ${res.status}`);
  return res.json();
}

interface ReeldbSearchItem {
  imdb_id?: string;
  title: string;
  year?: number;
  type?: string;
  poster?: string;
  plot?: string;
  rating?: number;
}

interface ReeldbTitle {
  imdb_id?: string;
  title: string;
  year?: number;
  plot?: string;
  poster?: string;
  backdrop?: string;
  runtime?: number;
  genres?: string[];
  rating?: number;
  providers?: Record<string, Record<string, { name: string; logo?: string }[]>>;
}

function mapSearchItem(item: ReeldbSearchItem): Movie {
  return {
    id: item.imdb_id || item.title,
    title: item.title,
    overview: item.plot || "",
    posterPath: item.poster || null,
    backdropPath: item.poster || null,
    releaseDate: item.year ? String(item.year) : "",
    voteAverage: item.rating || 0,
    genreIds: [],
  };
}

function mapProviders(data: ReeldbTitle): StreamingProvider[] {
  const region = getRegion().toLowerCase();
  const providers: StreamingProvider[] = [];
  const regionProviders = data.providers?.[region] || data.providers?.[region.toUpperCase()];

  if (!regionProviders) return providers;

  const typeMap: Record<string, StreamingProvider["type"]> = {
    flatrate: "flatrate",
    stream: "flatrate",
    free: "free",
    rent: "rent",
    buy: "buy",
  };

  for (const [key, list] of Object.entries(regionProviders)) {
    const type = typeMap[key] || "flatrate";
    list?.forEach((p) => {
      if (!providers.some((s) => s.name === p.name)) {
        providers.push({
          name: p.name,
          logo: p.logo || "",
          type,
        });
      }
    });
  }

  return providers;
}

function mapTitle(data: ReeldbTitle): MovieDetail {
  const streaming = mapProviders(data);
  return {
    id: data.imdb_id || data.title,
    title: data.title,
    overview: data.plot || "",
    posterPath: data.poster || null,
    backdropPath: data.backdrop || data.poster || null,
    releaseDate: data.year ? String(data.year) : "",
    voteAverage: data.rating || 0,
    genreIds: [],
    genres: data.genres,
    runtime: data.runtime,
    streaming,
    streamingStatus: streaming.length > 0 ? "available" : "unavailable",
  };
}

export async function searchMovies(query: string, page = 1): Promise<Movie[]> {
  const data = await reeldbFetch<{ results: ReeldbSearchItem[] }>("/v1/search", {
    q: query,
    type: "movie",
    page: String(page),
  });
  return (data.results || []).map(mapSearchItem);
}

export async function getMovieDetails(id: string): Promise<MovieDetail> {
  const params: Record<string, string> = { append: "providers" };
  if (id.startsWith("tt")) {
    params.imdb = id;
  } else {
    params.tmdb = id;
  }
  const data = await reeldbFetch<ReeldbTitle>("/v1/title", params);
  return mapTitle(data);
}

export async function getMoviesByIds(ids: string[]): Promise<Movie[]> {
  const movies: Movie[] = [];
  for (const id of ids) {
    try {
      const detail = await getMovieDetails(id);
      movies.push(detail);
    } catch {
      // skip
    }
  }
  return movies;
}

export async function discoverMovies(params: {
  genreQuery?: string;
  page?: number;
}): Promise<Movie[]> {
  if (params.genreQuery) {
    return searchMovies(params.genreQuery, params.page || 1);
  }
  return [];
}

export const STATIC_GENRES: Genre[] = [
  { id: "action", name: "Action" },
  { id: "comedy", name: "Comedy" },
  { id: "drama", name: "Drama" },
  { id: "horror", name: "Horror" },
  { id: "romance", name: "Romance" },
  { id: "sci-fi", name: "Sci-Fi" },
  { id: "thriller", name: "Thriller" },
  { id: "animation", name: "Animation" },
  { id: "adventure", name: "Adventure" },
  { id: "fantasy", name: "Fantasy" },
];

export function isReeldbConfigured(): boolean {
  const key = process.env.REELDB_API_KEY;
  return Boolean(key && key !== "your_reeldb_api_key_here");
}
