/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Neutral grey scale (no blue tint) for a true greyscale dark theme.
        gray: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
        accent: {
          DEFAULT: "#8a2be2",
          soft: "#a855f7",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        info: "#3b82f6",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
      },
      fontFamily: {
        sans: ["Raleway_400Regular"],
        raleway: ["Raleway_400Regular"],
        "raleway-medium": ["Raleway_500Medium"],
        "raleway-semibold": ["Raleway_600SemiBold"],
        "raleway-bold": ["Raleway_700Bold"],
        "raleway-extrabold": ["Raleway_800ExtraBold"],
      },
    },
  },
  plugins: [],
};
