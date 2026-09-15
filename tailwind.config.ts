import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17212b",
        paper: "#f8f6f2",
        orange: { 500: "#ec7a45", 600: "#d95d2e" },
        teal: { 500: "#287c78", 600: "#1f625e" },
        line: "#e7e1d8",
      },
      fontFamily: { sans: ["DM Sans", "ui-sans-serif", "sans-serif"] },
      boxShadow: { soft: "0 18px 50px rgba(30, 37, 44, 0.08)" },
    },
  },
  plugins: [],
} satisfies Config;
