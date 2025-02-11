import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base colors
        background: "#ffe6f0", // Light pink background
        foreground: "#2e2e2e", // Dark text for contrast

        // Card & popover (light backgrounds with dark text)
        card: {
          DEFAULT: "#ffffff",
          foreground: "#2e2e2e",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#2e2e2e",
        },

        // Primary & secondary colors for main actions
        primary: {
          DEFAULT: "#ff3366", // Romantic red
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#b366ff", // Romantic purple
          foreground: "#ffffff",
        },

        // Muted & accent colors (a soft gold and reusing the romantic red)
        muted: {
          DEFAULT: "#ffcc66", // Romantic gold-ish
          foreground: "#2e2e2e",
        },
        accent: {
          DEFAULT: "#ff3366",
          foreground: "#ffffff",
        },

        // Destructive actions (a deeper red)
        destructive: {
          DEFAULT: "#e6004c",
          foreground: "#ffffff",
        },

        // Other necessary colors
        border: "#d1a3b8", // A soft mauve border color
        input: "#ffe6f0",  // Same as background
        ring: "#ff3366",   // Focus ring color matching primary
        chart: {
          '1': "#ff3366",
          '2': "#b366ff",
          '3': "#ffcc66",
          '4': "#ffe6f0",
          '5': "#d1a3b8",
        },

        // Additional romantic colors
        redAccent: "#ff3366",
        romanticPink: "#ffe6f0",
        romanticRed: "#ff3366",
        romanticPurple: "#b366ff",
        romanticGold: "#ffcc66",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
