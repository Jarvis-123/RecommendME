import type { Genre, Movie, MovieDetail } from "./types";
import { apiFetch } from "./http";

const OMDB_BASE = "https://www.omdbapi.com";

function getApiKey(): string {
  const key = process.env.OMDB_API_KEY;
  if (!key || key === "your_omdb_api_key_here") {
    throw new Error("OMDB_API_KEY is not configured");
  }
  return key;
}

async function omdbFetch(params: Record<string, string>): Promise<Record<string, unknown>> {
  const url = new URL(OMDB_BASE);
  url.searchParams.set("apikey", getApiKey());
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await apiFetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`OMDb API error: ${res.status}`);

  const data = await res.json();
  if (data.Response === "False") {
    throw new Error(data.Error as string || "OMDb request failed");
  }
  return data;
}

interface OmdbSearchItem {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

function mapSearchItem(item: OmdbSearchItem): Movie {
  return {
    id: item.imdbID,
    title: item.Title,
    overview: "",
    posterPath: item.Poster !== "N/A" ? item.Poster : null,
    backdropPath: item.Poster !== "N/A" ? item.Poster : null,
    releaseDate: item.Year,
    voteAverage: 0,
    genreIds: [],
  };
}

function mapDetail(data: Record<string, unknown>): MovieDetail {
  const genres = typeof data.Genre === "string"
    ? data.Genre.split(", ").filter((g) => g !== "N/A")
    : [];

  const runtime = typeof data.Runtime === "string"
    ? parseInt(data.Runtime.replace(/\D/g, "")) || undefined
    : undefined;

  const rating = parseFloat(data.imdbRating as string) || 0;
  const poster = data.Poster as string;

  return {
    id: data.imdbID as string,
    title: data.Title as string,
    overview: (data.Plot as string) !== "N/A" ? (data.Plot as string) : "",
    posterPath: poster !== "N/A" ? poster : null,
    backdropPath: poster !== "N/A" ? poster : null,
    releaseDate: (data.Released as string) !== "N/A" ? (data.Released as string) : (data.Year as string) || "",
    voteAverage: rating,
    genreIds: [],
    genres,
    runtime,
    streaming: [],
    streamingStatus: "unavailable",
  };
}

export async function searchMovies(query: string, page = 1, year?: string): Promise<Movie[]> {
  const params: Record<string, string> = { s: query, type: "movie", page: String(page) };
  if (year) params.y = year;
  const data = await omdbFetch(params);
  const results = (data.Search as OmdbSearchItem[]) || [];
  return results.filter((r) => r.Type === "movie").map(mapSearchItem);
}

export async function getMovieDetails(id: string): Promise<MovieDetail> {
  const data = await omdbFetch({ i: id, plot: "full" });
  return mapDetail(data);
}

export async function getMoviesByIds(ids: string[]): Promise<Movie[]> {
  const movies: Movie[] = [];
  for (const id of ids) {
    try {
      const detail = await getMovieDetails(id);
      movies.push(detail);
    } catch {
      // skip unavailable titles
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

export function isOmdbConfigured(): boolean {
  const key = process.env.OMDB_API_KEY;
  return Boolean(key && key !== "your_omdb_api_key_here");
}
