"use client";

import Image from "next/image";
import { Star, Play } from "lucide-react";
import type { Movie } from "@/lib/types";
import { motion } from "framer-motion";

interface MovieCardProps {
  movie: Movie;
  onClick?: (movie: Movie) => void;
  size?: "sm" | "md" | "lg";
  showOverview?: boolean;
}

export function MovieCard({ movie, onClick, size = "md", showOverview = false }: MovieCardProps) {
  const sizeClasses = {
    sm: "w-36",
    md: "w-44",
    lg: "w-56",
  };

  const heightClasses = {
    sm: "h-52",
    md: "h-64",
    lg: "h-80",
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`card-movie group flex-shrink-0 ${sizeClasses[size]}`}
      onClick={() => onClick?.(movie)}
    >
      <div className={`relative ${heightClasses[size]} w-full`}>
        {movie.posterPath ? (
          <Image
            src={movie.posterPath}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 150px, 200px"
          />
        ) : (
          <div className="w-full h-full bg-midnight-800 flex items-center justify-center">
            <Play className="w-12 h-12 text-midnight-500" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {showOverview && (
            <p className="text-xs text-midnight-200 line-clamp-2 mb-2">{movie.overview}</p>
          )}
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-semibold">{movie.voteAverage.toFixed(1)}</span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-display font-semibold text-sm line-clamp-1">{movie.title}</h3>
        <p className="text-xs text-midnight-300 mt-0.5">
          {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "N/A"}
        </p>
      </div>
    </motion.div>
  );
}
