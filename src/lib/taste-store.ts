import type { Movie } from "./types";

export interface MovieRating {
  movieId: string;
  title: string;
  posterPath: string | null;
  score: number; // 1-10
  guiltyPleasure?: boolean;
  ratedAt: string;
}

export interface TasteProfile {
  watchlist: MovieRating[];
  watched: MovieRating[];
  disliked: string[]; // movie IDs marked "not interested"
  streamingServices: string[];
  region: string;
  likedGenres: string[];
  partnerLikedGenres: string[];
}

const STORAGE_KEY = "recommendme-taste-v1";

export const STREAMING_OPTIONS = [
  "Netflix",
  "Amazon Prime Video",
  "Disney Plus",
  "Apple TV Plus",
  "HBO Max",
  "Hulu",
  "Hotstar",
  "Paramount Plus",
  "Peacock",
  "JioCinema",
  "Sony LIV",
  "Zee5",
] as const;

const DEFAULT_PROFILE: TasteProfile = {
  watchlist: [],
  watched: [],
  disliked: [],
  streamingServices: [],
  region: "IN",
  likedGenres: [],
  partnerLikedGenres: [],
};

export function loadTasteProfile(): TasteProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveTasteProfile(profile: TasteProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function getExcludedIds(profile: TasteProfile): Set<string> {
  const ids = new Set<string>();
  profile.watchlist.forEach((m) => ids.add(m.movieId));
  profile.watched.forEach((m) => ids.add(m.movieId));
  profile.disliked.forEach((id) => ids.add(id));
  return ids;
}

export function filterExcluded(movies: Movie[], profile: TasteProfile): Movie[] {
  const excluded = getExcludedIds(profile);
  return movies.filter((m) => !excluded.has(m.id));
}

export function calculateTasteStrength(profile: TasteProfile): number {
  const rated = profile.watched.length;
  const watchlist = profile.watchlist.length;
  const disliked = profile.disliked.length;
  const score = rated * 3 + watchlist + disliked * 0.5;
  return Math.min(100, Math.round(score));
}

export function extractGenresFromRatings(profile: TasteProfile): string[] {
  const genreCounts: Record<string, number> = {};
  profile.likedGenres.forEach((g) => {
    genreCounts[g] = (genreCounts[g] || 0) + 2;
  });
  return Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([g]) => g);
}

export function addToWatchlist(
  profile: TasteProfile,
  movie: Movie
): TasteProfile {
  if (profile.watchlist.some((m) => m.movieId === movie.id)) return profile;
  if (profile.watched.some((m) => m.movieId === movie.id)) return profile;
  return {
    ...profile,
    watchlist: [
      {
        movieId: movie.id,
        title: movie.title,
        posterPath: movie.posterPath,
        score: 0,
        ratedAt: new Date().toISOString(),
      },
      ...profile.watchlist,
    ],
    disliked: profile.disliked.filter((id) => id !== movie.id),
  };
}

export function rateMovie(
  profile: TasteProfile,
  movie: Movie,
  score: number,
  options?: { guiltyPleasure?: boolean; genres?: string[] }
): TasteProfile {
  const entry: MovieRating = {
    movieId: movie.id,
    title: movie.title,
    posterPath: movie.posterPath,
    score,
    guiltyPleasure: options?.guiltyPleasure,
    ratedAt: new Date().toISOString(),
  };

  const watched = [
    entry,
    ...profile.watched.filter((m) => m.movieId !== movie.id),
  ];
  const watchlist = profile.watchlist.filter((m) => m.movieId !== movie.id);
  const disliked = profile.disliked.filter((id) => id !== movie.id);

  let likedGenres = [...profile.likedGenres];
  if (score >= 7 && options?.genres) {
    options.genres.forEach((g) => {
      if (!likedGenres.includes(g)) likedGenres.push(g);
    });
  }
  if (score <= 3 && options?.genres) {
    likedGenres = likedGenres.filter((g) => !options.genres!.includes(g));
  }

  return { ...profile, watched, watchlist, disliked, likedGenres };
}

export function markNotInterested(profile: TasteProfile, movieId: string): TasteProfile {
  return {
    ...profile,
    disliked: profile.disliked.includes(movieId)
      ? profile.disliked
      : [...profile.disliked, movieId],
    watchlist: profile.watchlist.filter((m) => m.movieId !== movieId),
  };
}

export function buildTasteContext(profile: TasteProfile): string {
  const topRated = profile.watched
    .filter((m) => m.score >= 8 && !m.guiltyPleasure)
    .slice(0, 8)
    .map((m) => m.title);
  const guilty = profile.watched
    .filter((m) => m.guiltyPleasure)
    .slice(0, 5)
    .map((m) => m.title);
  const dislikedGenres = extractGenresFromRatings({
    ...profile,
    watched: profile.watched.filter((m) => m.score <= 3),
  });

  const parts: string[] = [];
  if (topRated.length) parts.push(`User loves: ${topRated.join(", ")}`);
  if (guilty.length) parts.push(`Guilty pleasures: ${guilty.join(", ")}`);
  if (profile.likedGenres.length)
    parts.push(`Favorite genres: ${profile.likedGenres.join(", ")}`);
  if (dislikedGenres.length)
    parts.push(`Avoid genres: ${dislikedGenres.join(", ")}`);
  if (profile.disliked.length)
    parts.push(`Already passed on ${profile.disliked.length} titles`);
  if (profile.streamingServices.length)
    parts.push(`Subscribed to: ${profile.streamingServices.join(", ")}`);

  return parts.join(". ");
}

export function matchesStreamingFilter(
  moviePlatforms: string[],
  userServices: string[]
): boolean {
  if (!userServices.length) return true;
  return moviePlatforms.some((p) =>
    userServices.some(
      (s) =>
        p.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(p.toLowerCase())
    )
  );
}
