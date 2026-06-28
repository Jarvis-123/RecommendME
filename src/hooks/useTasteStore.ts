"use client";

import { useState, useEffect, useCallback } from "react";
import type { Movie } from "@/lib/types";
import {
  loadTasteProfile,
  saveTasteProfile,
  addToWatchlist,
  rateMovie,
  markNotInterested,
  calculateTasteStrength,
  type TasteProfile,
} from "@/lib/taste-store";

export function useTasteStore() {
  const [profile, setProfile] = useState<TasteProfile | null>(null);

  useEffect(() => {
    setProfile(loadTasteProfile());
  }, []);

  const persist = useCallback((next: TasteProfile) => {
    setProfile(next);
    saveTasteProfile(next);
  }, []);

  const addWatchlist = useCallback(
    (movie: Movie) => {
      if (!profile) return;
      persist(addToWatchlist(profile, movie));
    },
    [profile, persist]
  );

  const rate = useCallback(
    (movie: Movie, score: number, options?: { guiltyPleasure?: boolean; genres?: string[] }) => {
      if (!profile) return;
      persist(rateMovie(profile, movie, score, options));
    },
    [profile, persist]
  );

  const notInterested = useCallback(
    (movieId: string) => {
      if (!profile) return;
      persist(markNotInterested(profile, movieId));
    },
    [profile, persist]
  );

  const updateProfile = useCallback(
    (patch: Partial<TasteProfile>) => {
      if (!profile) return;
      persist({ ...profile, ...patch });
    },
    [profile, persist]
  );

  const tasteStrength = profile ? calculateTasteStrength(profile) : 0;

  return {
    profile,
    tasteStrength,
    addWatchlist,
    rate,
    notInterested,
    updateProfile,
    isReady: profile !== null,
  };
}
