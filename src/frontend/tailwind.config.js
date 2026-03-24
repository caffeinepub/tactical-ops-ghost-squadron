/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "oklch(var(--primary))",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary))",
          foreground: "oklch(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted))",
          foreground: "oklch(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "oklch(var(--accent))",
          foreground: "oklch(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive))",
          foreground: "oklch(var(--destructive-foreground))",
        },
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring))",
        allied: "oklch(var(--allied))",
        hostile: "oklch(var(--hostile))",
        success: "oklch(var(--success))",
        orange: {
          400: "oklch(0.68 0.14 55)",
          500: "oklch(0.60 0.13 55)",
          600: "oklch(0.53 0.12 55)",
        },
      },
      fontFamily: {
        condensed: ["'Barlow Condensed'", "sans-serif"],
        sans: ["'Barlow'", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        hud: "0 0 20px oklch(0.60 0.13 55 / 0.15), inset 0 1px 0 oklch(0.60 0.13 55 / 0.1)",
        panel: "0 4px 24px oklch(0 0 0 / 0.4)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
