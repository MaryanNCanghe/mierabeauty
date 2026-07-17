import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },

      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "Georgia", "serif"],
        body:    ["var(--font-body)", "DM Sans", "Helvetica", "Arial", "sans-serif"],
        // keep z alias for unmigrated classes
        z: ["var(--font-body)", "DM Sans", "Helvetica", "Arial", "sans-serif"],
      },

      colors: {
        m: {
          black:  "#0A0A0A",
          white:  "#FAFAF8",
          gold:   "#C9A96E",
          earth:  "#7A4F35",
          blush:  "#EDD9C8",
          muted:  "#6B6B6B",
          subtle: "#A8A39D",
        },
        // keep z alias for unmigrated classes
        z: {
          black: "#0A0A0A",
          white: "#FAFAF8",
          mid:   "#6B6B6B",
          hover: "#7A4F35",
          focus: "#C9A96E",
        },
      },

      fontSize: {
        "z-label-m": "0.6875rem",
        "m-label":   "0.6875rem",
      },

      borderWidth: {
        hairline: "0.5px",
      },
    },
  },
  plugins: [],
};

export default config;
