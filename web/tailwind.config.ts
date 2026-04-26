import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      colors: {
        bg: {
          primary: "#FAF7F2",
          card: "#FFFFFF",
          "card-sage": "#EEF4EC",
          "card-sky": "#EAF1F6",
          "card-sand": "#F4EFE6",
          "card-apricot": "#F7EDE2",
          "tile-empty": "#F4EFE6",
        },
        accent: {
          sage: "#7FA487",
          "sage-hover": "#6E9376",
          sky: "#7CA0BD",
          "sky-hover": "#6B8FAC",
        },
        ink: {
          primary: "#2A2724",
          secondary: "#6B655E",
          muted: "#9A9189",
        },
        state: {
          low: "#C97F6E",
          mid: "#D5B47E",
          high: "#7FA487",
          success: "#7FA487",
          error: "#B86B5C",
        },
        line: { soft: "#EBE6DE" },
      },
      borderRadius: {
        card: "18px",
        button: "14px",
        input: "12px",
        tile: "16px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(42,39,36,0.04), 0 2px 8px rgba(42,39,36,0.04)",
        elevated:
          "0 2px 4px rgba(42,39,36,0.06), 0 8px 24px rgba(42,39,36,0.06)",
      },
      fontSize: {
        display: ["28px", { lineHeight: "36px", fontWeight: "500" }],
      },
    },
  },
  plugins: [],
} satisfies Config;
