import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        nexa: {
          bg: {
            base: "var(--nexa-bg-base)",
            surface: "var(--nexa-bg-surface)",
            overlay: "var(--nexa-bg-overlay)",
            glass: "var(--nexa-bg-glass)",
          },
          brand: {
            DEFAULT: "var(--nexa-brand)",
            light: "var(--nexa-brand-light)",
            mid: "var(--nexa-brand-mid)",
            glow: "var(--nexa-brand-glow)",
          },
          accent: {
            DEFAULT: "var(--nexa-accent)",
            light: "var(--nexa-accent-light)",
          },
          amber: {
            DEFAULT: "var(--nexa-amber)",
            light: "var(--nexa-amber-light)",
          },
          coral: "var(--nexa-coral)",
          text: {
            primary: "var(--nexa-text-primary)",
            secondary: "var(--nexa-text-secondary)",
            muted: "var(--nexa-text-muted)",
            faint: "var(--nexa-text-faint)",
          },
          border: {
            DEFAULT: "var(--nexa-border)",
            mid: "var(--nexa-border-mid)",
          },
        },
      },
      borderRadius: {
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        xl: "var(--r-xl)",
        "2xl": "var(--r-2xl)",
      },
      fontSize: {
        xs: "var(--fs-xs)",
        sm: "var(--fs-sm)",
        base: "var(--fs-base)",
        md: "var(--fs-md)",
        lg: "var(--fs-lg)",
        xl: "var(--fs-xl)",
        "2xl": "var(--fs-2xl)",
        "3xl": "var(--fs-3xl)",
        "4xl": "var(--fs-4xl)",
        "5xl": "var(--fs-5xl)",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        display: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      boxShadow: {
        sm: "var(--nexa-shadow-sm)",
        md: "var(--nexa-shadow-md)",
        glass: "var(--nexa-shadow-glass)",
      },
    },
  },
  plugins: [],
};
export default config;
