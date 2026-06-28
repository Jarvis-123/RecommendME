"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import type { MoodProfile, Movie } from "@/lib/types";
import { MOODS, OCCASIONS, COMPANY, DURATIONS } from "@/lib/types";
import { MovieCard } from "./MovieCard";
import { useTaste } from "@/contexts/TasteContext";
import { buildTasteContext } from "@/lib/taste-store";

interface MoodQuizProps {
  onSelectMovie: (movie: Movie) => void;
}

const STEPS = ["mood", "occasion", "company", "duration", "results"] as const;
type Step = (typeof STEPS)[number];

export function MoodQuiz({ onSelectMovie }: MoodQuizProps) {
  const { profile: tasteProfile } = useTaste();
  const [step, setStep] = useState<Step>("mood");
  const [profile, setProfile] = useState<Partial<MoodProfile>>({ genres: [] });
  const [results, setResults] = useState<{ movies: Movie[]; reasoning: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const next = () => {
    const nextStep = STEPS[stepIndex + 1];
    if (nextStep === "results") {
      fetchResults();
    } else {
      setStep(nextStep);
    }
  };

  const back = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1]);
  };

  const fetchResults = async () => {
    setLoading(true);
    setStep("results");
    try {
      const excludeIds = tasteProfile
        ? [
            ...tasteProfile.watchlist.map((m) => m.movieId),
            ...tasteProfile.watched.map((m) => m.movieId),
            ...tasteProfile.disliked,
          ]
        : [];
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "mood",
          profile: profile as MoodProfile,
          excludeIds,
          tasteContext: tasteProfile ? buildTasteContext(tasteProfile) : "",
        }),
      });
      const data = await res.json();
      setResults(data);
    } catch {
      setResults({
        movies: [],
        reasoning: "Something went wrong. Please try again!",
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case "mood":
        return !!profile.mood;
      case "occasion":
        return !!profile.occasion;
      case "company":
        return !!profile.company;
      case "duration":
        return !!profile.duration;
      default:
        return true;
    }
  };

  const OptionGrid = ({
    options,
    field,
    columns = 2,
  }: {
    options: readonly { id: string; label: string; emoji: string; color?: string }[];
    field: keyof MoodProfile;
    columns?: number;
  }) => (
    <div className={columns === 2 ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"}>
      {options.map((opt) => {
        const selected = profile[field] === opt.id;
        return (
          <motion.button
            key={opt.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setProfile((p) => ({ ...p, [field]: opt.id }))}
            className={`relative p-4 sm:p-6 rounded-2xl text-left transition-all duration-200 ${
              selected
                ? "ring-2 ring-cinema-500 bg-cinema-500/20"
                : "glass-hover"
            }`}
          >
            <span className="text-3xl sm:text-4xl block mb-2">{opt.emoji}</span>
            <span className="font-display font-semibold text-sm sm:text-base">{opt.label}</span>
            {selected && (
              <motion.div
                layoutId="selected"
                className="absolute inset-0 rounded-2xl ring-2 ring-cinema-500 pointer-events-none"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      {step !== "results" && (
        <div className="mb-8">
          <div className="h-1.5 rounded-full bg-midnight-800 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cinema-500 to-cinema-400 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-midnight-400 mt-2">
            Step {stepIndex + 1} of {STEPS.length - 1}
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === "mood" && (
          <motion.div key="mood" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">How are you feeling?</h2>
            <p className="text-midnight-300 mb-6">Pick the vibe that matches your mood right now</p>
            <div className="grid grid-cols-2 gap-3">
              {MOODS.map((m) => {
                const selected = profile.mood === m.id;
                return (
                  <motion.button
                    key={m.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setProfile((p) => ({ ...p, mood: m.id }))}
                    className={`p-4 sm:p-5 rounded-2xl text-left transition-all ${
                      selected ? "ring-2 ring-cinema-500" : "glass-hover"
                    }`}
                  >
                    <span className="text-3xl block mb-2">{m.emoji}</span>
                    <span className="font-display font-semibold text-sm">{m.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === "occasion" && (
          <motion.div key="occasion" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">What&apos;s the occasion?</h2>
            <p className="text-midnight-300 mb-6">This helps us nail the perfect pick</p>
            <OptionGrid options={OCCASIONS} field="occasion" columns={2} />
          </motion.div>
        )}

        {step === "company" && (
          <motion.div key="company" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">Who&apos;s watching?</h2>
            <p className="text-midnight-300 mb-6">Different crowds, different movies</p>
            <OptionGrid options={COMPANY} field="company" columns={2} />
          </motion.div>
        )}

        {step === "duration" && (
          <motion.div key="duration" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">How much time do you have?</h2>
            <p className="text-midnight-300 mb-6">No one likes a movie that runs past bedtime</p>
            <OptionGrid options={DURATIONS} field="duration" columns={2} />
          </motion.div>
        )}

        {step === "results" && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            {loading ? (
              <div className="flex flex-col items-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-cinema-500 mb-4" />
                <p className="text-midnight-300">Finding your perfect movies...</p>
              </div>
            ) : results ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-cinema-400" />
                  <h2 className="font-display text-2xl sm:text-3xl font-bold">Your Picks!</h2>
                </div>
                <p className="text-midnight-200 mb-6 leading-relaxed">{results.reasoning}</p>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {results.movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} size="lg" onClick={onSelectMovie} showOverview />
                  ))}
                </div>
                <button
                  onClick={() => {
                    setStep("mood");
                    setProfile({ genres: [] });
                    setResults(null);
                  }}
                  className="btn-secondary mt-6"
                >
                  Start Over
                </button>
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {step !== "results" && (
        <div className="flex justify-between mt-8">
          <button
            onClick={back}
            disabled={stepIndex === 0}
            className="btn-secondary disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button onClick={next} disabled={!canProceed()} className="btn-primary disabled:opacity-50">
            {step === "duration" ? "Get My Picks!" : "Next"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
