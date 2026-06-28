"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import type { ChatMessage, Movie } from "@/lib/types";
import { MovieCard } from "./MovieCard";
import { motion } from "framer-motion";
import { useTaste } from "@/contexts/TasteContext";
import { buildTasteContext } from "@/lib/taste-store";

interface ChatPanelProps {
  onSelectMovie: (movie: Movie) => void;
  initialMessage?: string;
}

const SUGGESTIONS = [
  "Something light for pizza night 🍕",
  "Mind-bending sci-fi like Inception",
  "Romantic comedy for date night",
  "Scary movie but not too scary",
  "Best movies from the 90s",
  "Something the whole family can watch",
];

export function ChatPanel({ onSelectMovie, initialMessage }: ChatPanelProps) {
  const { profile } = useTaste();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hey! 👋 Can't decide what to watch? Tell me your mood, who you're with, or what you're eating — I'll find the perfect movie!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialMessage) {
      sendMessage(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const excludeIds = profile
        ? [
            ...profile.watchlist.map((m) => m.movieId),
            ...profile.watched.map((m) => m.movieId),
            ...profile.disliked,
          ]
        : [];
      const tasteContext = profile ? buildTasteContext(profile) : "";

      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, tasteContext, excludeIds }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reasoning || "Here are my top picks for you!",
          movies: data.movies,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Oops! Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] sm:h-[600px] max-w-3xl mx-auto glass rounded-3xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-hide">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-cinema-600 text-white rounded-br-md"
                  : "glass rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" && (
                <Sparkles className="w-4 h-4 text-cinema-400 mb-1" />
              )}
              <p className="text-sm sm:text-base leading-relaxed">{msg.content}</p>
              {msg.movies && msg.movies.length > 0 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                  {msg.movies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      size="sm"
                      onClick={onSelectMovie}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl px-4 py-3 rounded-bl-md">
              <Loader2 className="w-5 h-5 animate-spin text-cinema-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs px-3 py-1.5 rounded-full glass-hover"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What are you in the mood for?"
            className="input-field flex-1"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary px-4 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
