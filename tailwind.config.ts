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
        bitme: {
          primary: "#2457E6",
          primaryHover: "#1d46be",
          primaryLight: "#EEF3FF",
          teal: "#16B8A6",
          tealHover: "#0f9687",
          tealLight: "#E8FAF7",
          bg: "#F5F7FB",
          surface: "#FFFFFF",
          text: "#172033",
          muted: "#64748B",
          border: "#E5EAF2",
        },
        brand: {
          50: "#EEF3FF",
          100: "#DBE7FE",
          200: "#BFD3FE",
          300: "#93B4FD",
          400: "#608BF9",
          500: "#2457E6",
          600: "#1D46BE",
          700: "#1A3B9E",
          800: "#1B337F",
          900: "#1C2E68",
          950: "#111C40",
        },
        navy: {
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
};

export default config;
