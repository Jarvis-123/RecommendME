"use client";

import { Film, Crown, Settings, Bookmark, BarChart3 } from "lucide-react";

interface HeaderProps {
  onPremiumClick?: () => void;
  onSettingsClick?: () => void;
  onWatchlistClick?: () => void;
  tasteStrength?: number;
}

export function Header({
  onPremiumClick,
  onSettingsClick,
  onWatchlistClick,
  tasteStrength = 0,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-midnight-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cinema-500 to-cinema-700 flex items-center justify-center">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">
              Recommend<span className="text-cinema-400">ME</span>
            </h1>
            <p className="text-[10px] text-midnight-400 leading-none hidden sm:block">
              What should we watch?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tasteStrength > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full glass text-xs">
              <BarChart3 className="w-3 h-3 text-cinema-400" />
              <span className="text-midnight-300">Taste</span>
              <span className="font-bold text-cinema-400">{tasteStrength}%</span>
            </div>
          )}
          <button
            onClick={onWatchlistClick}
            className="p-2 rounded-full glass-hover"
            title="Watchlist"
          >
            <Bookmark className="w-4 h-4 text-midnight-300" />
          </button>
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-full glass-hover"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-midnight-300" />
          </button>
          <button
            onClick={onPremiumClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                       bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30
                       text-amber-300 hover:from-amber-500/30 hover:to-yellow-500/30 transition-all"
          >
            <Crown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Go Premium</span>
          </button>
        </div>
      </div>
    </header>
  );
}
