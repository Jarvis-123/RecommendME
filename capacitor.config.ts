import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: "com.recommendme.app",
  appName: "RecommendME",
  webDir: "www",
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: serverUrl.startsWith("http://"),
        androidScheme: serverUrl.startsWith("https") ? "https" : "http",
      }
    : undefined,
  android: {
    allowMixedContent: true,
    backgroundColor: "#0f1524",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0f1524",
      showSpinner: true,
      spinnerColor: "#df5f50",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0f1524",
    },
  },
};

export default config;
