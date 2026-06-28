"use client";

import { X, Settings, Tv, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { STREAMING_OPTIONS } from "@/lib/taste-store";
import type { TasteProfile } from "@/lib/taste-store";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  profile: TasteProfile;
  onUpdate: (patch: Partial<TasteProfile>) => void;
}

const REGIONS = [
  { code: "IN", label: "India" },
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
];

export function SettingsPanel({ open, onClose, profile, onUpdate }: SettingsPanelProps) {
  const toggleService = (service: string) => {
    const current = profile.streamingServices;
    onUpdate({
      streamingServices: current.includes(service)
        ? current.filter((s) => s !== service)
        : [...current, service],
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto glass rounded-t-3xl sm:rounded-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-cinema-400" />
                <h2 className="font-display text-xl font-bold">Your Setup</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-midnight-400" />
                <h3 className="font-semibold text-sm">Region</h3>
              </div>
              <p className="text-xs text-midnight-400 mb-3">
                Fixes outdated streaming info — a top complaint on Taste
              </p>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map((r) => (
                  <button
                    key={r.code}
                    onClick={() => onUpdate({ region: r.code })}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      profile.region === r.code
                        ? "bg-cinema-500 text-white"
                        : "glass-hover"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Tv className="w-4 h-4 text-midnight-400" />
                <h3 className="font-semibold text-sm">My Streaming Services</h3>
              </div>
              <p className="text-xs text-midnight-400 mb-3">
                Only show movies available on platforms you actually have
              </p>
              <div className="flex flex-wrap gap-2">
                {STREAMING_OPTIONS.map((service) => (
                  <button
                    key={service}
                    onClick={() => toggleService(service)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      profile.streamingServices.includes(service)
                        ? "bg-cinema-500/30 border border-cinema-500 text-cinema-200"
                        : "glass-hover"
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </section>

            <p className="text-xs text-midnight-500 mt-8 text-center">
              Streaming data can be outdated — always verify on the platform before watching
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
