export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#7C3AED",
        secondary: "#22C55E",
        highlight: "#3B82F6",
        base: "#F8FAFC",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        glass: "0 20px 50px rgba(15, 23, 42, 0.12)",
        glow: "0 0 45px rgba(124, 58, 237, 0.35)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        drift: {
          "0%": { transform: "translateX(0px) translateY(0px)" },
          "50%": { transform: "translateX(40px) translateY(-30px)" },
          "100%": { transform: "translateX(0px) translateY(0px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        drift: "drift 14s ease-in-out infinite",
        pulseGlow: "pulseGlow 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
