import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./remotion/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "unfocused-border-color": "var(--unfocused-border-color)",
        "focused-border-color": "var(--focused-border-color)",

        "button-disabled-color": "var(--button-disabled-color)",
        "disabled-text-color": "var(--disabled-text-color)",

        "geist-error": "var(--geist-error)",

        primary: "#0aebbf",
        "primary-dark": "#2dac92",

        secondary: "#bf0aeb",
        "secondary-dark": "#922dac",

        subtitle: "var(--subtitle)",
      },
      padding: {
        "geist-quarter": "var(--geist-quarter-pad)",
        "geist-half": "var(--geist-half-pad)",
        geist: "var(--geist-pad)",
      },
      spacing: {
        "geist-quarter": "var(--geist-quarter-pad)",
        "geist-half": "var(--geist-half-pad)",
        geist: "var(--geist-pad)",
      },

      borderRadius: {
        geist: "var(--geist-border-radius)",
      },

      fontFamily: {
        geist: "var(--geist-font)",
      },

      animation: {
        spinner: "spinner 1.2s linear infinite",
        "animated-background": "animatedBackground 60s linear infinite",
        "wing-image": "wingimage 1.5s steps(1, end) infinite",
      },

      keyframes: {
        spinner: {
          "0%": {
            opacity: "1",
          },
          "100%": {
            opacity: "0.15",
          },
        },
        wingimage: {
          "0%": {
            background: 'center / contain no-repeat url("/wing_1.png")',
          },
          "50%": {
            background: 'center / contain no-repeat url("/wing_2.png")',
          },
          "100%": {
            background: 'center / contain no-repeat url("/wing_1.png")',
          },
        },
        animatedBackground: {
          from: {
            backgroundPosition: "0px 0px",
          },
          to: {
            backgroundPosition: "1280px 0px",
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
