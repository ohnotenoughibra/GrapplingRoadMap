import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        mat: {
          50: "rgb(var(--mat-50) / <alpha-value>)",
          100: "rgb(var(--mat-100) / <alpha-value>)",
          200: "rgb(var(--mat-200) / <alpha-value>)",
          300: "rgb(var(--mat-300) / <alpha-value>)",
          400: "rgb(var(--mat-400) / <alpha-value>)",
          500: "rgb(var(--mat-500) / <alpha-value>)",
          600: "rgb(var(--mat-600) / <alpha-value>)",
          700: "rgb(var(--mat-700) / <alpha-value>)",
          800: "rgb(var(--mat-800) / <alpha-value>)",
          900: "rgb(var(--mat-900) / <alpha-value>)",
          950: "rgb(var(--mat-950) / <alpha-value>)",
        },
        gi: {
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
        },
        nogi: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
        wrestling: {
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInFromBottom: {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.8)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-in-bottom": "slideInFromBottom 0.2s ease-out",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
