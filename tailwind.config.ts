import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "vatican-blue": "#0083F5",
        "vatican-blue-dark": "#0069CC",
        "vatican-yellow": "#fcd34d",
        "vatican-gray": "#F5F5F5",
        "vatican-dark": "#333333",
        "vatican-text": "#222222",
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring))",
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        primary: {
          DEFAULT: "oklch(var(--primary))",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary))",
          foreground: "oklch(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive))",
          foreground: "oklch(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted))",
          foreground: "oklch(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "oklch(var(--accent))",
          foreground: "oklch(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
      },
      fontSize: {
        "base": ["1.125rem", { lineHeight: "1.75rem" }], // 18px
        "lg": ["1.25rem", { lineHeight: "1.875rem" }], // 20px
        "xl": ["1.5rem", { lineHeight: "2rem" }], // 24px
        "2xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
        "3xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
        "4xl": ["3rem", { lineHeight: "1.2" }], // 48px
        "5xl": ["3.75rem", { lineHeight: "1.2" }], // 60px
      },
      fontFamily: {
        sans: ['var(--font-be-vietnam-pro)', 'sans-serif'],
        serif: ['var(--font-lora)', 'serif'],
      },
    },
  },
  safelist: ["lg:grid-cols-5"],
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;
