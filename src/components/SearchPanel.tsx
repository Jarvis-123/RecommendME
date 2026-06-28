"use client";

import { useState, useEffect } from "react";
import { Search, X, Loader2, Lightbulb } from "lucide-react";
import type { Movie } from "@/lib/types";
import { MovieCard } from "./MovieCard";
import { useTaste } from "@/contexts/TasteContext";
import { filterExcluded } from "@/lib/taste-store";

interface SearchPanelProps {
  onSelectMovie: (movie: Movie) => void;
}

export function SearchPanel({ onSelectMovie }: SearchPanelProps) {
  const { profile } = useTaste();
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query });
        if (year) params.set("year", year);
        const res = await fetch(`/api/search?${params}`);
        const data = await res.json();
        const movies = profile ? filterExcluded(data.movies || [], profile) : data.movies || [];
        setResults(movies);
        setSearched(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, year, profile]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Title or "director name" for vague searches'
            className="input-field pl-12 pr-12 text-lg"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10">
              <X className="w-4 h-4 text-midnight-400" />
            </button>
          )}
        </div>
        <input
          type="text"
          value={year}
          onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="Year"
          className="input-field w-24 text-center"
        />
      </div>

      <div className="flex items-start gap-2 p-3 rounded-xl bg-midnight-900/40 text-xs text-midnight-400">
        <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p>
          Vague title like &quot;The Boy&quot;? Add the <strong>year</strong> or search the <strong>director&apos;s name</strong> — fixes a top Taste search complaint.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cinema-500" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-midnight-300">No movies found for &ldquo;{query}&rdquo;{year ? ` (${year})` : ""}</p>
          <p className="text-xs text-midnight-500 mt-2">Try a different spelling or add the release year</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
          {results.map((movie) => (
            <div key={movie.id} onClick={() => onSelectMovie(movie)}>
              <MovieCard movie={movie} size="md" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
