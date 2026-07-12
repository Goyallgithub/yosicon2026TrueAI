/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F0F0F0",
        foreground: "#121212",
        muted: "#E0E0E0",
        bauhaus: {
          red: "#D02020",
          blue: "#1040C0",
          yellow: "#F0C020",
        },
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "bauhaus-sm": "3px 3px 0px 0px #121212",
        bauhaus: "4px 4px 0px 0px #121212",
        "bauhaus-md": "6px 6px 0px 0px #121212",
        "bauhaus-lg": "8px 8px 0px 0px #121212",
      },
    },
  },
  plugins: [],
};
