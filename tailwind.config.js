import { fontFamily } from "tailwindcss/defaultTheme"
import plugin from "tailwindcss/plugin"

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Dark mode focused palette with modern accents
        background: "hsl(240 10% 3.9%)",
        foreground: "hsl(0 0% 98%)",
        primary: {
          DEFAULT: "hsl(210 100% 50%)",
          foreground: "hsl(210 20% 99%)",
          100: "hsl(210 100% 95%)",
          200: "hsl(210 100% 85%)",
          300: "hsl(210 100% 75%)",
          400: "hsl(210 100% 65%)",
          500: "hsl(210 100% 50%)",
          600: "hsl(210 100% 45%)",
          700: "hsl(210 100% 35%)",
          800: "hsl(210 100% 25%)",
          900: "hsl(210 100% 15%)",
        },
        secondary: {
          DEFAULT: "hsl(280 100% 60%)",
          foreground: "hsl(210 20% 99%)",
        },
        accent: {
          DEFAULT: "hsl(160 100% 45%)",
          foreground: "hsl(210 20% 99%)",
        },
        muted: {
          DEFAULT: "hsl(240 3.7% 15.9%)",
          foreground: "hsl(240 5% 64.9%)",
        },
        card: {
          DEFAULT: "hsl(240 10% 5.9%)",
          foreground: "hsl(0 0% 98%)",
        },
        border: "hsl(240 3.7% 15.9%)",
        input: "hsl(240 3.7% 15.9%)",
        ring: "hsl(210 100% 50%)",
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        heading: ["var(--font-heading)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(({ addVariant }) => {
      addVariant("hocus", ["&:hover", "&:focus"])
    }),
  ],
}

export default config