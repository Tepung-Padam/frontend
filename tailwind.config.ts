import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17242b",
        paper: "#f6f5f1",
        orange: { 50: "#fff6f0", 100: "#ffeadc", 500: "#e87532", 600: "#c95b21", 700: "#a84618" },
        teal: { 50: "#edf8f6", 100: "#d6efeb", 500: "#167b76", 600: "#116560", 700: "#0e504d" },
        line: "#e3e2dc",
      },
      fontFamily: { sans: ["DM Sans", "ui-sans-serif", "sans-serif"] },
      borderRadius: { "2xl": "1rem", "3xl": "1.35rem" },
      boxShadow: { soft: "0 1px 2px rgba(23, 36, 43, 0.04), 0 10px 30px rgba(23, 36, 43, 0.05)" },
    },
  },
  plugins: [],
} satisfies Config;
