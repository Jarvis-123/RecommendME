import type { Genre, Movie, MovieDetail, StreamingProvider } from "./types";
import { apiFetch } from "./http";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key || key === "your_tmdb_api_key_here") {
    throw new Error("TMDB_API_KEY is not configured");
  }
  return key;
}

function getRegion(): string {
  return process.env.TMDB_REGION || "US";
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", getApiKey());
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await apiFetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
}

function mapMovie(m: TmdbMovie): Movie {
  return {
    id: String(m.id),
    title: m.title,
    overview: m.overview,
    posterPath: m.poster_path ? `${TMDB_IMAGE}/w500${m.poster_path}` : null,
    backdropPath: m.backdrop_path ? `${TMDB_IMAGE}/w1280${m.backdrop_path}` : null,
    releaseDate: m.release_date,
    voteAverage: m.vote_average,
    genreIds: m.genre_ids || m.genres?.map((g) => g.id) || [],
    genres: m.genres?.map((g) => g.name),
    runtime: m.runtime,
  };
}

export async function getGenres(): Promise<Genre[]> {
  const data = await tmdbFetch<{ genres: Genre[] }>("/genre/movie/list");
  return data.genres;
}

export async function searchMovies(query: string, page = 1): Promise<Movie[]> {
  const data = await tmdbFetch<{ results: TmdbMovie[] }>("/search/movie", {
    query,
    page: String(page),
    include_adult: "false",
  });
  return data.results.map(mapMovie);
}

export async function discoverMovies(params: {
  genres?: number[];
  mood?: string;
  minRuntime?: number;
  maxRuntime?: number;
  sortBy?: string;
  page?: number;
}): Promise<Movie[]> {
  const queryParams: Record<string, string> = {
    sort_by: params.sortBy || "popularity.desc",
    include_adult: "false",
    page: String(params.page || 1),
    "vote_count.gte": "100",
  };

  if (params.genres?.length) {
    queryParams.with_genres = params.genres.join(",");
  }
  if (params.minRuntime) queryParams["with_runtime.gte"] = String(params.minRuntime);
  if (params.maxRuntime) queryParams["with_runtime.lte"] = String(params.maxRuntime);

  const data = await tmdbFetch<{ results: TmdbMovie[] }>("/discover/movie", queryParams);
  return data.results.map(mapMovie);
}

export async function getTrendingMovies(): Promise<Movie[]> {
  const data = await tmdbFetch<{ results: TmdbMovie[] }>("/trending/movie/week");
  return data.results.map(mapMovie);
}

export async function getMovieDetails(id: number): Promise<MovieDetail> {
  const [movie, providers, videos] = await Promise.all([
    tmdbFetch<TmdbMovie>(`/movie/${id}`),
    tmdbFetch<{
      results: Record<
        string,
        {
          flatrate?: { provider_name: string; logo_path: string }[];
          rent?: { provider_name: string; logo_path: string }[];
          buy?: { provider_name: string; logo_path: string }[];
          free?: { provider_name: string; logo_path: string }[];
        }
      >;
    }>(`/movie/${id}/watch/providers`),
    tmdbFetch<{ results: { key: string; site: string; type: string }[] }>(`/movie/${id}/videos`),
  ]);

  const region = getRegion();
  const regionData = providers.results[region];
  const streaming: StreamingProvider[] = [];

  if (regionData) {
    const addProviders = (
      list: { provider_name: string; logo_path: string }[] | undefined,
      type: StreamingProvider["type"]
    ) => {
      list?.forEach((p) => {
        if (!streaming.some((s) => s.name === p.provider_name)) {
          streaming.push({
            name: p.provider_name,
            logo: `${TMDB_IMAGE}/w45${p.logo_path}`,
            type,
          });
        }
      });
    };
    addProviders(regionData.flatrate, "flatrate");
    addProviders(regionData.free, "free");
    addProviders(regionData.rent, "rent");
    addProviders(regionData.buy, "buy");
  }

  const trailer = videos.results.find((v) => v.site === "YouTube" && v.type === "Trailer");

  return {
    ...mapMovie(movie),
    streaming,
    streamingStatus: streaming.length > 0 ? "available" : "unavailable",
    trailerKey: trailer?.key,
    tagline: movie.tagline,
  };
}

export async function getRecommendations(movieId: number): Promise<Movie[]> {
  const data = await tmdbFetch<{ results: TmdbMovie[] }>(`/movie/${movieId}/recommendations`);
  return data.results.map(mapMovie);
}

export async function getMoviesByGenre(genreId: number, page = 1): Promise<Movie[]> {
  return discoverMovies({ genres: [genreId], page });
}

export function isTmdbConfigured(): boolean {
  const key = process.env.TMDB_API_KEY;
  return Boolean(key && key !== "your_tmdb_api_key_here");
}
