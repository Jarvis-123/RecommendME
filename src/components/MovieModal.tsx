"use client";

import Image from "next/image";
import { X, Star, Clock, Play, ExternalLink, Bookmark, Ban, Sparkles } from "lucide-react";
import type { MovieDetail } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTaste } from "@/contexts/TasteContext";

interface MovieModalProps {
  movie: MovieDetail | null;
  onClose: () => void;
}

export function MovieModal({ movie, onClose }: MovieModalProps) {
  const { profile, addWatchlist, rate, notInterested } = useTaste();
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [guiltyPleasure, setGuiltyPleasure] = useState(false);

  if (!movie) return null;

  const inWatchlist = profile?.watchlist.some((m) => m.movieId === movie.id);
  const userRating = profile?.watched.find((m) => m.movieId === movie.id);

  const filteredStreaming =
    profile?.streamingServices.length
      ? movie.streaming.filter((p) =>
          profile.streamingServices.some(
            (s) =>
              p.name.toLowerCase().includes(s.toLowerCase().split(" ")[0]) ||
              s.toLowerCase().includes(p.name.toLowerCase().split(" ")[0])
          )
        )
      : movie.streaming;

  const handleRate = (score: number) => {
    setSelectedScore(score);
    rate(movie, score, {
      guiltyPleasure,
      genres: movie.genres,
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl glass"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative h-48 sm:h-64">
            {movie.backdropPath ? (
              <Image src={movie.backdropPath} alt={movie.title} fill className="object-cover rounded-t-3xl" sizes="800px" />
            ) : movie.posterPath ? (
              <Image src={movie.posterPath} alt={movie.title} fill className="object-cover rounded-t-3xl" sizes="800px" />
            ) : (
              <div className="w-full h-full bg-midnight-800" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/60 to-transparent" />
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full glass hover:bg-white/20">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 -mt-8 relative">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">{movie.title}</h2>
            {movie.tagline && <p className="text-midnight-300 italic mt-1 text-sm">{movie.tagline}</p>}

            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {movie.voteAverage.toFixed(1)}
              </span>
              {movie.releaseDate && (
                <span className="text-sm text-midnight-300">
                  {new Date(movie.releaseDate).getFullYear() || movie.releaseDate}
                </span>
              )}
              {movie.runtime && (
                <span className="flex items-center gap-1 text-sm text-midnight-300">
                  <Clock className="w-4 h-4" />
                  {movie.runtime} min
                </span>
              )}
              {movie.genres?.map((g) => (
                <span key={g} className="px-2 py-0.5 rounded-full text-xs glass">{g}</span>
              ))}
            </div>

            {/* Quick actions — Taste users hated too many taps */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => addWatchlist(movie)}
                disabled={inWatchlist || !!userRating}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  inWatchlist ? "bg-cinema-500/30 text-cinema-300" : "glass-hover"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                {inWatchlist ? "Saved" : "Want to Watch"}
              </button>
              <button
                onClick={() => { notInterested(movie.id); onClose(); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm glass-hover text-red-300"
              >
                <Ban className="w-4 h-4" />
                Not Interested
              </button>
            </div>

            {/* 1-10 rating — Taste users requested this over binary like/dislike */}
            <div className="mt-5 p-4 rounded-2xl bg-midnight-900/50 border border-white/5">
              <p className="text-sm font-semibold mb-3">
                Rate it {userRating ? `(you rated ${userRating.score}/10)` : ""}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleRate(n)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                      (selectedScore ?? userRating?.score) === n
                        ? "bg-cinema-500 text-white scale-110"
                        : "glass-hover"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={guiltyPleasure || userRating?.guiltyPleasure}
                  onChange={(e) => setGuiltyPleasure(e.target.checked)}
                  className="rounded accent-cinema-500"
                />
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-midnight-300">Guilty pleasure (bad but I love it)</span>
              </label>
            </div>

            <p className="mt-4 text-midnight-200 leading-relaxed text-sm sm:text-base">
              {movie.overview || "No overview available."}
            </p>

            <div className="mt-6">
              <h3 className="font-display font-semibold text-lg mb-1">Where to Watch</h3>
              <p className="text-xs text-amber-400/80 mb-3">
                Verify on the platform — streaming info can be outdated (a common Taste complaint)
              </p>

              {profile?.streamingServices.length && filteredStreaming.length === 0 && movie.streaming.length > 0 ? (
                <div className="px-4 py-3 rounded-xl bg-midnight-800/50 border border-midnight-700 mb-3">
                  <p className="text-sm text-midnight-300">
                    Not on your selected services. Available on: {movie.streaming.map((p) => p.name).join(", ")}
                  </p>
                </div>
              ) : null}

              {(filteredStreaming.length > 0 || (!profile?.streamingServices.length && movie.streamingStatus === "available")) ? (
                <div className="flex flex-wrap gap-3">
                  {(profile?.streamingServices.length ? filteredStreaming : movie.streaming).map((provider) => (
                    <a
                      key={provider.name}
                      href={`https://www.google.com/search?q=${encodeURIComponent(movie.title + " " + provider.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-white/10 transition-colors"
                    >
                      {provider.logo ? (
                        <Image src={provider.logo} alt={provider.name} width={24} height={24} className="rounded" />
                      ) : (
                        <span className="text-lg">📺</span>
                      )}
                      <span className="text-sm font-medium">{provider.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-40" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-midnight-800/50 border border-midnight-700">
                  <span className="text-2xl">📺</span>
                  <div>
                    <p className="font-medium text-midnight-200">Currently not on any platform</p>
                    <p className="text-xs text-midnight-400 mt-0.5">
                      May be in cinemas or coming to streaming soon
                    </p>
                  </div>
                </div>
              )}
            </div>

            {movie.trailerKey && (
              <a
                href={`https://www.youtube.com/watch?v=${movie.trailerKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-6 w-full sm:w-auto"
              >
                <Play className="w-4 h-4" />
                Watch Trailer
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
