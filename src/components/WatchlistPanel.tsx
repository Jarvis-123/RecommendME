"use client";

import Image from "next/image";
import { Bookmark, CheckCircle, X } from "lucide-react";
import type { TasteProfile } from "@/lib/taste-store";
import type { Movie } from "@/lib/types";

interface WatchlistPanelProps {
  profile: TasteProfile;
  onSelectMovie: (movie: Movie) => void;
}

export function WatchlistPanel({ profile, onSelectMovie }: WatchlistPanelProps) {
  const toMovie = (entry: { movieId: string; title: string; posterPath: string | null }): Movie => ({
    id: entry.movieId,
    title: entry.title,
    posterPath: entry.posterPath,
    backdropPath: null,
    overview: "",
    releaseDate: "",
    voteAverage: 0,
    genreIds: [],
  });

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Bookmark className="w-5 h-5 text-cinema-400" />
          <h2 className="font-display text-xl font-bold">Want to Watch</h2>
          <span className="text-sm text-midnight-400">({profile.watchlist.length})</span>
        </div>
        {profile.watchlist.length === 0 ? (
          <p className="text-midnight-400 text-sm">
            Save movies from the detail view — they won&apos;t be recommended again
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {profile.watchlist.map((entry) => (
              <button
                key={entry.movieId}
                onClick={() => onSelectMovie(toMovie(entry))}
                className="text-left glass-hover rounded-xl overflow-hidden"
              >
                {entry.posterPath ? (
                  <Image src={entry.posterPath} alt={entry.title} width={160} height={240} className="w-full aspect-[2/3] object-cover" />
                ) : (
                  <div className="w-full aspect-[2/3] bg-midnight-800" />
                )}
                <p className="p-2 text-xs font-medium line-clamp-2">{entry.title}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <h2 className="font-display text-xl font-bold">Watched & Rated</h2>
          <span className="text-sm text-midnight-400">({profile.watched.length})</span>
        </div>
        {profile.watched.length === 0 ? (
          <p className="text-midnight-400 text-sm">
            Rate movies to build your taste profile — recommendations get smarter fast
          </p>
        ) : (
          <div className="space-y-2">
            {profile.watched.slice(0, 20).map((entry) => (
              <button
                key={entry.movieId}
                onClick={() => onSelectMovie(toMovie(entry))}
                className="w-full flex items-center gap-3 p-3 glass-hover rounded-xl text-left"
              >
                {entry.posterPath && (
                  <Image src={entry.posterPath} alt="" width={40} height={60} className="rounded object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{entry.title}</p>
                  {entry.guiltyPleasure && (
                    <span className="text-xs text-amber-400">Guilty pleasure</span>
                  )}
                </div>
                <span className="font-display font-bold text-cinema-400">{entry.score}/10</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {profile.disliked.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <X className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold text-midnight-400">
              Hidden ({profile.disliked.length} not interested)
            </h3>
          </div>
        </section>
      )}
    </div>
  );
}
