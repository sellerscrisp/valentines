import type { Config } from "tailwindcss"

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

        // Valentine reds/pinks
        // #C00000 (deep red), #FF3334 (bright red), #FF6F77 (light red/pink),
        // #FFBCB1 (salmon pink), #FFDEE3 (soft pink), #FF88C2 (light pinkish tone)
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

        // A milder pink that can be used for subdued backgrounds
        muted: {
          DEFAULT: "#ffbcb1",
          foreground: "#2e2e2e",
        },

        // If you need a destructive action color, we can reuse #ff3334 or pick #c00000
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
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config
