"use client";

import { X, Crown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
}

const FEATURES = [
  "Unlimited AI chat recommendations",
  "Ad-free experience",
  "Multi-region streaming availability",
  "\"Notify me when available\" alerts",
  "Unlimited watchlists & taste profiles",
  "Priority voice recognition",
];

export function PremiumModal({ open, onClose }: PremiumModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-md glass rounded-3xl p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-display text-2xl font-bold">RecommendME Premium</h2>
              <p className="text-midnight-300 mt-2 text-sm">
                Never struggle to pick a movie again
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="text-center">
              <p className="font-display text-3xl font-bold">
                $3.99<span className="text-base font-normal text-midnight-400">/mo</span>
              </p>
              <button
                className="btn-primary w-full mt-4 opacity-60 cursor-not-allowed"
                disabled
              >
                Coming Soon
              </button>
              <p className="text-xs text-midnight-500 mt-3">
                Premium features are planned for a future release
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
