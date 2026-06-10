import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          cream: "#F5F0E8",
          "cream-dark": "#EBE4D8",
          blue: "#3B6FE8",
          "blue-dark": "#2F5FD4",
          "blue-light": "#B8C9F0",
          brown: "#3D2E1F",
          gold: "#B8956A",
          lavender: "#D4CCE8",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(61, 46, 31, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
