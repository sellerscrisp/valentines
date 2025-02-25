import type { Config } from "tailwindcss"

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base colors
        background: "#ffdee3", // A soft pink from the palette
        foreground: "#2e2e2e", // Dark text for contrast

        // Card & popover backgrounds (light) with dark text
        card: {
          DEFAULT: "#ffffff",
          foreground: "#2e2e2e",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#2e2e2e",
        },
        primary: {
          DEFAULT: "#c00000", // Darkest red
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#ff3334", // Bright red
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#ff6f77", // Light red/pink
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#ffbcb1",
          foreground: "#2e2e2e",
        },
        destructive: {
          DEFAULT: "#ff3334",
          foreground: "#ffffff",
        },

        // Additional pink tone for optional usage
        pinkLight: "#ff88c2", // Guessed final color from the scheme

        // Border color that contrasts well with a pink background
        border: "#ffcbd0", // A subtle pinkish border
        input: "#ffffff",  // Same as background for inputs
        ring: "#c00000",   // Focus ring color matching the darkest red
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        first: "moveVertical 30s ease infinite",
        second: "moveInCircle 20s reverse infinite",
        third: "moveInCircle 40s linear infinite",
        fourth: "moveHorizontal 40s ease infinite",
        fifth: "moveInCircle 20s ease infinite",
      },
      keyframes: {
        shimmer: {
          from: {
            backgroundPosition: "0 0",
          },
          to: {
            backgroundPosition: "-200% 0",
          },
        },
        moveHorizontal: {
          "0%": {
            transform: "translateX(-50%) translateY(-10%)",
          },
          "50%": {
            transform: "translateX(50%) translateY(10%)",
          },
          "100%": {
            transform: "translateX(-50%) translateY(-10%)",
          },
        },
        moveInCircle: {
          "0%": {
            transform: "rotate(0deg)",
          },
          "50%": {
            transform: "rotate(180deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
        moveVertical: {
          "0%": {
            transform: "translateY(-50%)",
          },
          "50%": {
            transform: "translateY(50%)",
          },
          "100%": {
            transform: "translateY(-50%)",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config
