import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          50: "#fdf4f3",
          100: "#fce8e6",
          200: "#f9d4d0",
          300: "#f4b3ac",
          400: "#ec8579",
          500: "#df5f50",
          600: "#cb4335",
          700: "#aa3529",
          800: "#8d2f26",
          900: "#762c25",
          950: "#40130f",
        },
        midnight: {
          50: "#f4f6fb",
          100: "#e8ecf6",
          200: "#ccd6ea",
          300: "#a0b3d7",
          400: "#6d8abf",
          500: "#4a6aa8",
          600: "#38538c",
          700: "#2f4373",
          800: "#293a60",
          900: "#263351",
          950: "#0f1524",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(223, 95, 80, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(223, 95, 80, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
