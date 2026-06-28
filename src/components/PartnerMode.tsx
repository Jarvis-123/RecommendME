"use client";

import { useState } from "react";
import { Users, Sparkles, Loader2 } from "lucide-react";
import type { Movie } from "@/lib/types";
import type { TasteProfile } from "@/lib/taste-store";
import { filterExcluded } from "@/lib/taste-store";
import { MovieCard } from "./MovieCard";

interface PartnerModeProps {
  profile: TasteProfile;
  onSelectMovie: (movie: Movie) => void;
  onUpdatePartnerGenres: (genres: string[]) => void;
}

const PARTNER_GENRES = [
  "Action", "Comedy", "Romance", "Horror", "Sci-Fi",
  "Drama", "Thriller", "Animation", "Documentary", "Fantasy",
];

export function PartnerMode({ profile, onSelectMovie, onUpdatePartnerGenres }: PartnerModeProps) {
  const [partnerGenres, setPartnerGenres] = useState<string[]>(profile.partnerLikedGenres);
  const [results, setResults] = useState<Movie[]>([]);
  const [reasoning, setReasoning] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleGenre = (genre: string) => {
    const next = partnerGenres.includes(genre)
      ? partnerGenres.filter((g) => g !== genre)
      : [...partnerGenres, genre];
    setPartnerGenres(next);
    onUpdatePartnerGenres(next);
  };

  const findMatch = async () => {
    setLoading(true);
    const myGenres = profile.likedGenres.join(", ") || "varied tastes";
    const theirGenres = partnerGenres.join(", ") || "open to anything";
    const message = `Find movies for a couple to watch together. Person A likes: ${myGenres}. Person B likes: ${theirGenres}. Pick movies both would enjoy — compromise picks, not extreme genres either hates.`;

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          tasteContext: `Couple mode. Avoid genres neither selected.`,
          excludeIds: [...profile.watchlist.map((m) => m.movieId), ...profile.watched.map((m) => m.movieId), ...profile.disliked],
        }),
      });
      const data = await res.json();
      setResults(filterExcluded(data.movies || [], profile));
      setReasoning(data.reasoning || "Here are picks you both might enjoy!");
    } catch {
      setReasoning("Couldn't fetch recommendations. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-6 h-6 text-cinema-400" />
        <h2 className="font-display text-2xl font-bold">Watch Together</h2>
      </div>
      <p className="text-midnight-300 mb-6 text-sm">
        Taste users wanted partner mode — pick what your partner likes and we&apos;ll find overlap with your taste
      </p>

      <div className="glass rounded-2xl p-4 mb-4">
        <p className="text-xs text-midnight-400 mb-2">Your taste (from ratings)</p>
        <div className="flex flex-wrap gap-2">
          {profile.likedGenres.length > 0 ? (
            profile.likedGenres.map((g) => (
              <span key={g} className="px-2 py-1 rounded-full text-xs bg-cinema-500/20 text-cinema-300">{g}</span>
            ))
          ) : (
            <span className="text-sm text-midnight-500">Rate a few movies first to build your profile</span>
          )}
        </div>
      </div>

      <p className="text-sm font-semibold mb-3">What does your partner enjoy?</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {PARTNER_GENRES.map((g) => (
          <button
            key={g}
            onClick={() => toggleGenre(g)}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
              partnerGenres.includes(g) ? "bg-cinema-500 text-white" : "glass-hover"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <button onClick={findMatch} disabled={loading} className="btn-primary w-full sm:w-auto">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        Find Movies for Both
      </button>

      {reasoning && (
        <p className="mt-6 text-midnight-200 text-sm leading-relaxed">{reasoning}</p>
      )}

      {results.length > 0 && (
        <div className="flex gap-4 overflow-x-auto mt-4 pb-4 scrollbar-hide">
          {results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onClick={onSelectMovie} size="md" />
          ))}
        </div>
      )}
    </div>
  );
}
