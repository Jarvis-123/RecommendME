export interface Movie {
  id: string;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  voteAverage: number;
  genreIds: number[];
  genres?: string[];
  runtime?: number;
}

export interface StreamingProvider {
  name: string;
  logo: string;
  type: "flatrate" | "rent" | "buy" | "free";
}

export interface MovieDetail extends Movie {
  streaming: StreamingProvider[];
  streamingStatus: "available" | "unavailable";
  trailerKey?: string;
  tagline?: string;
}

export interface Genre {
  id: string | number;
  name: string;
}

export interface MoodProfile {
  mood: string;
  occasion: string;
  company: string;
  duration: string;
  genres: number[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  movies?: Movie[];
}

export const MOODS = [
  { id: "happy", label: "Happy & Uplifting", emoji: "😊", color: "from-yellow-400 to-orange-400" },
  { id: "chill", label: "Chill & Relaxed", emoji: "😌", color: "from-blue-400 to-cyan-400" },
  { id: "excited", label: "Thrilled & Excited", emoji: "🤩", color: "from-red-500 to-pink-500" },
  { id: "emotional", label: "Deep & Emotional", emoji: "🥹", color: "from-purple-400 to-indigo-500" },
  { id: "scared", label: "Scary & Spooky", emoji: "👻", color: "from-gray-600 to-gray-900" },
  { id: "curious", label: "Mind-Bending", emoji: "🧠", color: "from-emerald-400 to-teal-500" },
  { id: "romantic", label: "Romantic", emoji: "💕", color: "from-pink-400 to-rose-500" },
  { id: "funny", label: "Laugh Out Loud", emoji: "😂", color: "from-amber-400 to-yellow-500" },
] as const;

export const OCCASIONS = [
  { id: "dinner", label: "Dinner Time", emoji: "🍽️" },
  { id: "late-night", label: "Late Night", emoji: "🌙" },
  { id: "weekend", label: "Weekend Binge", emoji: "🎬" },
  { id: "date", label: "Date Night", emoji: "💑" },
  { id: "family", label: "Family Time", emoji: "👨‍👩‍👧‍👦" },
  { id: "solo", label: "Solo Watch", emoji: "🛋️" },
] as const;

export const COMPANY = [
  { id: "alone", label: "Just Me", emoji: "🧘" },
  { id: "partner", label: "With Partner", emoji: "💑" },
  { id: "friends", label: "With Friends", emoji: "👯" },
  { id: "family", label: "With Family", emoji: "👪" },
] as const;

export const DURATIONS = [
  { id: "short", label: "Under 90 min", emoji: "⚡" },
  { id: "medium", label: "90–120 min", emoji: "🎞️" },
  { id: "long", label: "Epic (120+ min)", emoji: "🏔️" },
  { id: "any", label: "Any Length", emoji: "♾️" },
] as const;

export const MOOD_GENRE_MAP: Record<string, number[]> = {
  happy: [35, 16, 10751, 10402],
  chill: [18, 99, 36],
  excited: [28, 12, 878],
  emotional: [18, 10749, 36],
  scared: [27, 53],
  curious: [878, 9648, 53],
  romantic: [10749, 18, 35],
  funny: [35, 16],
};

export const PLATFORM_NAMES: Record<string, string> = {
  Netflix: "Netflix",
  "Amazon Prime Video": "Prime Video",
  "Disney Plus": "Disney+",
  "Apple TV Plus": "Apple TV+",
  "HBO Max": "Max",
  Hulu: "Hulu",
  "Paramount Plus": "Paramount+",
  Peacock: "Peacock",
  "Crunchyroll": "Crunchyroll",
  Hotstar: "Hotstar",
};
