import type { Genre, Movie, MovieDetail } from "./types";
import { MOOD_GENRE_MAP } from "./types";
import { CURATED_LISTS, MOOD_GENRE_SEARCH } from "./curated";
import * as tmdb from "./tmdb";
import * as omdb from "./omdb";
import * as reeldb from "./reeldb";

export type MovieProvider = "tmdb" | "omdb" | "reeldb" | "auto";

function resolveProvider(): MovieProvider {
  const configured = process.env.MOVIE_PROVIDER || "auto";

  if (configured !== "auto") return configured as MovieProvider;

  if (reeldb.isReeldbConfigured()) return "reeldb";
  if (omdb.isOmdbConfigured()) return "omdb";
  if (tmdb.isTmdbConfigured()) return "tmdb";

  return "omdb";
}

export function getActiveProvider(): MovieProvider {
  return resolveProvider();
}

export function isMovieDataConfigured(): boolean {
  return tmdb.isTmdbConfigured() || omdb.isOmdbConfigured() || reeldb.isReeldbConfigured();
}

export function getProviderLabel(): string {
  const p = resolveProvider();
  if (p === "reeldb") return "ReelDB";
  if (p === "omdb") return "OMDb";
  if (p === "tmdb") return "TMDB";
  return "None";
}

async function withProvider<T>(
  handlers: {
    tmdb: () => Promise<T>;
    omdb: () => Promise<T>;
    reeldb: () => Promise<T>;
  }
): Promise<T> {
  const provider = resolveProvider();
  if (provider === "tmdb") return handlers.tmdb();
  if (provider === "reeldb") return handlers.reeldb();
  return handlers.omdb();
}

export async function searchMovies(query: string, page = 1, year?: string): Promise<Movie[]> {
  if (!isMovieDataConfigured()) {
    throw new Error("No movie data API configured");
  }
  return withProvider({
    tmdb: () => tmdb.searchMovies(query, page),
    omdb: () => omdb.searchMovies(query, page, year),
    reeldb: () => reeldb.searchMovies(year ? `${query} ${year}` : query, page),
  });
}

export async function getMovieDetails(id: string): Promise<MovieDetail> {
  if (!isMovieDataConfigured()) {
    throw new Error("No movie data API configured");
  }
  return withProvider({
    tmdb: () => tmdb.getMovieDetails(parseInt(id)),
    omdb: () => omdb.getMovieDetails(id),
    reeldb: () => reeldb.getMovieDetails(id),
  });
}

export async function getGenres(): Promise<Genre[]> {
  if (!isMovieDataConfigured()) {
    throw new Error("No movie data API configured");
  }
  return withProvider({
    tmdb: () => tmdb.getGenres(),
    omdb: async () => omdb.STATIC_GENRES,
    reeldb: async () => reeldb.STATIC_GENRES,
  });
}

export async function getTrendingMovies(): Promise<Movie[]> {
  if (!isMovieDataConfigured()) {
    throw new Error("No movie data API configured");
  }
  return withProvider({
    tmdb: () => tmdb.getTrendingMovies(),
    omdb: () => omdb.getMoviesByIds([...CURATED_LISTS.trending]),
    reeldb: () => reeldb.getMoviesByIds([...CURATED_LISTS.trending]),
  });
}

export async function discoverMovies(params: {
  genres?: number[];
  mood?: string;
  minRuntime?: number;
  maxRuntime?: number;
  sortBy?: string;
  page?: number;
}): Promise<Movie[]> {
  if (!isMovieDataConfigured()) {
    throw new Error("No movie data API configured");
  }

  const provider = resolveProvider();

  if (provider === "tmdb") {
    return tmdb.discoverMovies(params);
  }

  const genreTerms = params.mood
    ? MOOD_GENRE_SEARCH[params.mood] || ["movie"]
    : params.genres?.length
      ? params.genres.map(String)
      : ["popular"];

  const query = genreTerms[Math.floor(Math.random() * genreTerms.length)];
  const handler = provider === "reeldb" ? reeldb : omdb;
  return handler.discoverMovies({ genreQuery: query, page: params.page });
}

export async function getBrowseData(): Promise<{
  trending: Movie[];
  byGenre: Record<string, Movie[]>;
}> {
  if (!isMovieDataConfigured()) {
    throw new Error("No movie data API configured");
  }

  const provider = resolveProvider();

  if (provider === "tmdb") {
    const [trending, action, comedy, drama, horror, scifi] = await Promise.all([
      tmdb.getTrendingMovies(),
      tmdb.discoverMovies({ genres: [28], page: 1 }),
      tmdb.discoverMovies({ genres: [35], page: 1 }),
      tmdb.discoverMovies({ genres: [18], page: 1 }),
      tmdb.discoverMovies({ genres: [27], page: 1 }),
      tmdb.discoverMovies({ genres: [878], page: 1 }),
    ]);
    return {
      trending: trending.slice(0, 10),
      byGenre: {
        action: action.slice(0, 10),
        comedy: comedy.slice(0, 10),
        drama: drama.slice(0, 10),
        horror: horror.slice(0, 10),
        scifi: scifi.slice(0, 10),
      },
    };
  }

  const fetchList = provider === "reeldb" ? reeldb.getMoviesByIds : omdb.getMoviesByIds;

  const [trending, action, comedy, drama, horror, scifi] = await Promise.all([
    fetchList([...CURATED_LISTS.trending]),
    fetchList([...CURATED_LISTS.action]),
    fetchList([...CURATED_LISTS.comedy]),
    fetchList([...CURATED_LISTS.drama]),
    fetchList([...CURATED_LISTS.horror]),
    fetchList([...CURATED_LISTS.scifi]),
  ]);

  return {
    trending: trending.slice(0, 10),
    byGenre: { action, comedy, drama, horror, scifi },
  };
}

export { MOOD_GENRE_MAP };
