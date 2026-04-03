/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F1F8E9",
          100: "#DCEDC8",
          200: "#C5E1A5",
          300: "#A5D6A7",
          500: "#388E3C",
          700: "#2E7D32",
          900: "#1B5E20",
        },
      },
      boxShadow: {
        panel: "0 16px 40px rgba(15, 23, 42, 0.08)",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.2)", opacity: "0" },
          "100%": { transform: "scale(1.2)", opacity: "0" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.6s ease-out infinite",
      },
    },
  },
  plugins: [],
};
