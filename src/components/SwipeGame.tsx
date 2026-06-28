"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Heart, X, RotateCcw, Trophy, Sparkles } from "lucide-react";
import type { Movie } from "@/lib/types";
import { useTaste } from "@/contexts/TasteContext";
import { filterExcluded } from "@/lib/taste-store";

interface SwipeGameProps {
  onSelectMovie: (movie: Movie) => void;
}

export function SwipeGame({ onSelectMovie }: SwipeGameProps) {
  const { profile, rate, notInterested, tasteStrength } = useTaste();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Movie[]>([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [guiltyPleasure, setGuiltyPleasure] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  useEffect(() => {
    if (!profile) return;
    fetch("/api/browse")
      .then((r) => r.json())
      .then((data) => {
        let pool = [
          ...(data.trending || []),
          ...(data.byGenre?.action || []),
          ...(data.byGenre?.comedy || []),
          ...(data.byGenre?.drama || []),
        ];
        pool = filterExcluded(pool, profile);

        // Prioritize movies matching user's liked genres (Taste complaint: too many unknown movies)
        if (profile.likedGenres.length) {
          pool.sort((a, b) => {
            const aMatch = a.genres?.some((g: string) => profile.likedGenres.includes(g)) ? 1 : 0;
            const bMatch = b.genres?.some((g: string) => profile.likedGenres.includes(g)) ? 1 : 0;
            return bMatch - aMatch;
          });
        } else {
          pool = pool.sort(() => Math.random() - 0.5);
        }

        setMovies(pool.slice(0, 15));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [profile]);

  const current = movies[currentIndex];

  const swipe = (direction: "left" | "right") => {
    if (!current) return;
    setExitDirection(direction);

    setTimeout(() => {
      if (direction === "right") {
        setLiked((prev) => [...prev, current]);
        rate(current, guiltyPleasure ? 7 : 8, {
          guiltyPleasure,
          genres: current.genres,
        });
      } else {
        notInterested(current.id);
      }

      if (currentIndex + 1 >= movies.length) {
        setFinished(true);
      } else {
        setCurrentIndex((i) => i + 1);
      }
      setExitDirection(null);
      x.set(0);
    }, 300);
  };

  const restart = () => {
    setCurrentIndex(0);
    setLiked([]);
    setFinished(false);
    setMovies((m) => [...m].sort(() => Math.random() - 0.5));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-12 h-12 border-4 border-cinema-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (finished) {
    return (
      <div className="max-w-lg mx-auto text-center">
        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="font-display text-3xl font-bold mb-2">Taste Profile: {tasteStrength}%</h2>
        <p className="text-midnight-300 mb-6">
          You liked {liked.length} out of {movies.length} — recommendations will improve
        </p>

        {liked.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide justify-center">
            {liked.map((movie) => (
              <div key={movie.id} onClick={() => onSelectMovie(movie)} className="flex-shrink-0 w-32 cursor-pointer">
                {movie.posterPath && (
                  <Image src={movie.posterPath} alt={movie.title} width={128} height={192} className="rounded-xl" />
                )}
                <p className="text-xs mt-1 line-clamp-1">{movie.title}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-midnight-400">You passed on everything! Try again?</p>
        )}

        <button onClick={restart} className="btn-primary mt-8">
          <RotateCcw className="w-4 h-4" />
          Play Again
        </button>
      </div>
    );
  }

  if (!current) {
    return <p className="text-center text-midnight-400">No new movies — rate more or clear your hidden list</p>;
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex justify-between items-center mb-4 px-2">
        <span className="text-sm text-midnight-400">{currentIndex + 1} / {movies.length}</span>
        <span className="text-sm text-cinema-400">Taste {tasteStrength}%</span>
      </div>

      <div className="relative h-[480px]">
        <AnimatePresence>
          <motion.div
            key={current.id}
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) swipe("right");
              else if (info.offset.x < -100) swipe("left");
            }}
            animate={exitDirection ? { x: exitDirection === "right" ? 300 : -300, opacity: 0 } : { x: 0, opacity: 1 }}
            className="absolute inset-0 rounded-3xl overflow-hidden glass cursor-grab active:cursor-grabbing"
          >
            {current.posterPath ? (
              <Image src={current.posterPath} alt={current.title} fill className="object-cover" sizes="400px" priority />
            ) : (
              <div className="w-full h-full bg-midnight-800" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 px-4 py-2 border-4 border-green-400 rounded-xl rotate-[-15deg]">
              <span className="text-green-400 font-bold text-2xl">LIKE</span>
            </motion.div>
            <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-8 px-4 py-2 border-4 border-red-400 rounded-xl rotate-[15deg]">
              <span className="text-red-400 font-bold text-2xl">NOPE</span>
            </motion.div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="font-display text-2xl font-bold">{current.title}</h3>
              <p className="text-sm text-midnight-300 mt-1 line-clamp-3">{current.overview}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <label className="flex items-center justify-center gap-2 mt-4 cursor-pointer">
        <input type="checkbox" checked={guiltyPleasure} onChange={(e) => setGuiltyPleasure(e.target.checked)} className="accent-cinema-500" />
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-xs text-midnight-400">Mark likes as guilty pleasure</span>
      </label>

      <div className="flex justify-center gap-8 mt-4">
        <button onClick={() => swipe("left")} className="w-16 h-16 rounded-full glass-hover flex items-center justify-center border-2 border-red-400/50">
          <X className="w-8 h-8 text-red-400" />
        </button>
        <button onClick={() => swipe("right")} className="w-16 h-16 rounded-full glass-hover flex items-center justify-center border-2 border-green-400/50">
          <Heart className="w-8 h-8 text-green-400" />
        </button>
      </div>
    </div>
  );
}
