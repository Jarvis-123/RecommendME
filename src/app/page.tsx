"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Sparkles,
  MessageCircle,
  Mic,
  Search,
  Heart,
  Clapperboard,
  ChevronRight,
  Users,
  Bookmark,
} from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { MoodQuiz } from "@/components/MoodQuiz";
import { ChatPanel } from "@/components/ChatPanel";
import { VoiceInput } from "@/components/VoiceInput";
import { SearchPanel } from "@/components/SearchPanel";
import { SwipeGame } from "@/components/SwipeGame";
import { MovieModal } from "@/components/MovieModal";
import { PremiumModal } from "@/components/PremiumModal";
import { SettingsPanel } from "@/components/SettingsPanel";
import { WatchlistPanel } from "@/components/WatchlistPanel";
import { PartnerMode } from "@/components/PartnerMode";
import { MovieCard } from "@/components/MovieCard";
import type { Movie, MovieDetail } from "@/lib/types";
import { useTaste } from "@/contexts/TasteContext";
import { filterExcluded } from "@/lib/taste-store";

type Tab = "home" | "mood" | "chat" | "voice" | "search" | "swipe" | "browse" | "watchlist" | "partner";

const TABS: { id: Tab; label: string; icon: typeof Sparkles; description: string }[] = [
  { id: "mood", label: "Mood Match", icon: Sparkles, description: "Quick quiz to find your perfect film" },
  { id: "chat", label: "AI Chat", icon: MessageCircle, description: "Learns from your taste profile" },
  { id: "voice", label: "Voice", icon: Mic, description: "Say it out loud" },
  { id: "swipe", label: "Swipe & Rate", icon: Heart, description: "Build taste fast — 1-10 ratings" },
  { id: "partner", label: "Watch Together", icon: Users, description: "Find movies you both enjoy" },
  { id: "search", label: "Search", icon: Search, description: "Title, year, or director" },
];

export default function Home() {
  const { profile, tasteStrength, updateProfile, isReady } = useTaste();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedMovie, setSelectedMovie] = useState<MovieDetail | null>(null);
  const [voiceMessage, setVoiceMessage] = useState<string | undefined>();
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [trending, setTrending] = useState<Movie[]>([]);

  useEffect(() => {
    if (!isReady) return;
    fetch("/api/browse")
      .then((r) => r.json())
      .then((data) => {
        const movies = data.trending || [];
        setTrending(profile ? filterExcluded(movies, profile) : movies);
      })
      .catch(() => {});
  }, [isReady, profile]);

  const handleSelectMovie = useCallback(async (movie: Movie) => {
    try {
      const res = await fetch(`/api/movies/${movie.id}`);
      const data = await res.json();
      setSelectedMovie(data.movie);
    } catch {
      setSelectedMovie({ ...movie, streaming: [], streamingStatus: "unavailable" });
    }
  }, []);

  const handleVoiceResult = async (transcript: string) => {
    setVoiceMessage(transcript);
    setActiveTab("chat");
    setVoiceLoading(false);
  };

  if (!isReady || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cinema-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        tasteStrength={tasteStrength}
        onPremiumClick={() => setPremiumOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
        onWatchlistClick={() => setActiveTab("watchlist")}
      />

      {activeTab === "home" && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 sm:mb-16">
            <h2 className="font-display text-4xl sm:text-6xl font-bold leading-tight">
              Can&apos;t decide what
              <br />
              <span className="gradient-text">to watch?</span>
            </h2>
            <p className="text-midnight-300 text-lg sm:text-xl mt-4 max-w-xl mx-auto">
              Built to fix what Taste users complained about — smarter recs, real watchlists, honest streaming info.
            </p>
            {tasteStrength > 0 && (
              <p className="text-sm text-cinema-400 mt-3">Your taste profile: {tasteStrength}% complete</p>
            )}
          </motion.section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {TABS.map((tab, i) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "chat") setVoiceMessage(undefined);
                }}
                className="glass-hover rounded-2xl p-6 text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-cinema-500/20 flex items-center justify-center mb-4 group-hover:bg-cinema-500/30 transition-colors">
                  <tab.icon className="w-6 h-6 text-cinema-400" />
                </div>
                <h3 className="font-display font-bold text-lg">{tab.label}</h3>
                <p className="text-sm text-midnight-400 mt-1">{tab.description}</p>
                <ChevronRight className="w-5 h-5 text-midnight-500 mt-3 group-hover:text-cinema-400 group-hover:translate-x-1 transition-all" />
              </motion.button>
            ))}

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setActiveTab("browse")}
              className="glass-hover rounded-2xl p-6 text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-midnight-700/50 flex items-center justify-center mb-4">
                <Clapperboard className="w-6 h-6 text-midnight-300" />
              </div>
              <h3 className="font-display font-bold text-lg">Browse All</h3>
              <p className="text-sm text-midnight-400 mt-1">Filter by rating & year</p>
              <ChevronRight className="w-5 h-5 text-midnight-500 mt-3 group-hover:text-cinema-400 group-hover:translate-x-1 transition-all" />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setActiveTab("watchlist")}
              className="glass-hover rounded-2xl p-6 text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-midnight-700/50 flex items-center justify-center mb-4">
                <Bookmark className="w-6 h-6 text-midnight-300" />
              </div>
              <h3 className="font-display font-bold text-lg">My Lists</h3>
              <p className="text-sm text-midnight-400 mt-1">{profile.watchlist.length} saved · {profile.watched.length} rated</p>
              <ChevronRight className="w-5 h-5 text-midnight-500 mt-3 group-hover:text-cinema-400 group-hover:translate-x-1 transition-all" />
            </motion.button>
          </div>

          {trending.length > 0 && (
            <section>
              <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-cinema-400">🔥</span> For You
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {trending.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} onClick={handleSelectMovie} />
                ))}
              </div>
            </section>
          )}
        </main>
      )}

      {activeTab !== "home" && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <button
            onClick={() => { setActiveTab("home"); setVoiceMessage(undefined); }}
            className="text-sm text-midnight-400 hover:text-cinema-400 mb-6 transition-colors"
          >
            ← Back to home
          </button>

          {activeTab === "mood" && <MoodQuiz onSelectMovie={handleSelectMovie} />}
          {activeTab === "chat" && <ChatPanel onSelectMovie={handleSelectMovie} initialMessage={voiceMessage} />}
          {activeTab === "voice" && (
            <div className="max-w-md mx-auto py-8">
              <h2 className="font-display text-2xl font-bold text-center mb-8">Tell us what you want</h2>
              <VoiceInput onResult={handleVoiceResult} disabled={voiceLoading} />
            </div>
          )}
          {activeTab === "search" && <SearchPanel onSelectMovie={handleSelectMovie} />}
          {activeTab === "swipe" && <SwipeGame onSelectMovie={handleSelectMovie} />}
          {activeTab === "partner" && (
            <PartnerMode
              profile={profile}
              onSelectMovie={handleSelectMovie}
              onUpdatePartnerGenres={(genres) => updateProfile({ partnerLikedGenres: genres })}
            />
          )}
          {activeTab === "watchlist" && <WatchlistPanel profile={profile} onSelectMovie={handleSelectMovie} />}
          {activeTab === "browse" && <BrowseSection profile={profile} onSelectMovie={handleSelectMovie} />}
        </main>
      )}

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      <PremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profile={profile}
        onUpdate={updateProfile}
      />

      <footer className="border-t border-white/5 mt-16 py-8 text-center">
        <p className="text-xs text-midnight-500">
          Fixes top Taste complaints: watchlist dedup · 1-10 ratings · streaming filters · partner mode
        </p>
      </footer>
    </div>
  );
}

function BrowseSection({
  profile,
  onSelectMovie,
}: {
  profile: ReturnType<typeof useTaste>["profile"];
  onSelectMovie: (m: Movie) => void;
}) {
  const [data, setData] = useState<Record<string, Movie[]>>({});
  const [loading, setLoading] = useState(true);
  const [minRating, setMinRating] = useState(0);
  const [minYear, setMinYear] = useState("");

  useEffect(() => {
    fetch("/api/browse")
      .then((r) => r.json())
      .then((d) => {
        setData({
          "🔥 Trending": d.trending || [],
          "💥 Action": d.byGenre?.action || [],
          "😂 Comedy": d.byGenre?.comedy || [],
          "🎭 Drama": d.byGenre?.drama || [],
          "👻 Horror": d.byGenre?.horror || [],
          "🚀 Sci-Fi": d.byGenre?.scifi || [],
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filterMovies = (movies: Movie[]) => {
    let filtered = profile ? filterExcluded(movies, profile) : movies;
    if (minRating > 0) filtered = filtered.filter((m) => m.voteAverage >= minRating);
    if (minYear) filtered = filtered.filter((m) => m.releaseDate?.includes(minYear));
    return filtered;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-cinema-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm text-midnight-400">Min IMDb rating:</label>
        {[0, 6, 7, 8].map((r) => (
          <button
            key={r}
            onClick={() => setMinRating(r)}
            className={`px-3 py-1 rounded-full text-sm ${minRating === r ? "bg-cinema-500 text-white" : "glass-hover"}`}
          >
            {r === 0 ? "Any" : `${r}+`}
          </button>
        ))}
        <input
          type="text"
          value={minYear}
          onChange={(e) => setMinYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="From year"
          className="input-field w-28 text-sm"
        />
      </div>

      {Object.entries(data).map(([label, movies]) => {
        const filtered = filterMovies(movies);
        return filtered.length > 0 ? (
          <section key={label}>
            <h3 className="font-display text-xl font-bold mb-4">{label}</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {filtered.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onClick={onSelectMovie} />
              ))}
            </div>
          </section>
        ) : null;
      })}
    </div>
  );
}
