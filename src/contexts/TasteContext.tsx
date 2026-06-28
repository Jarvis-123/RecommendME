"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useTasteStore } from "@/hooks/useTasteStore";

type TasteStore = ReturnType<typeof useTasteStore>;

const TasteContext = createContext<TasteStore | null>(null);

export function TasteProvider({ children }: { children: ReactNode }) {
  const store = useTasteStore();
  return <TasteContext.Provider value={store}>{children}</TasteContext.Provider>;
}

export function useTaste() {
  const ctx = useContext(TasteContext);
  if (!ctx) throw new Error("useTaste must be used within TasteProvider");
  return ctx;
}
