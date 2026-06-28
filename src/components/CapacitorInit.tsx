"use client";

import { useEffect } from "react";

export function CapacitorInit() {
  useEffect(() => {
    const init = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#0f1524" });

        const { SplashScreen } = await import("@capacitor/splash-screen");
        await SplashScreen.hide();
      } catch {
        // Capacitor plugins not available in browser
      }
    };
    init();
  }, []);

  return null;
}
