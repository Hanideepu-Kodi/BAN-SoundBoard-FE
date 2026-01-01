import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
      },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Inter", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"],
      },
      colors: {
        "bg-base": "rgb(var(--color-bg-base) / <alpha-value>)",
        "bg-surface": "rgb(var(--color-bg-surface) / <alpha-value>)",
        "bg-card": "rgb(var(--color-bg-card) / <alpha-value>)",
        "fg-primary": "rgb(var(--color-fg-primary) / <alpha-value>)",
        "fg-muted": "rgb(var(--color-fg-muted) / <alpha-value>)",
        "brand-primary": "rgb(var(--color-brand-primary) / <alpha-value>)",
        "brand-accent": "rgb(var(--color-brand-accent) / <alpha-value>)",
        "brand-warm": "rgb(var(--color-brand-warm) / <alpha-value>)",
        "stroke-subtle": "rgb(var(--color-stroke-subtle) / <alpha-value>)",
        "status-success": "rgb(74 222 128 / <alpha-value>)",
        "status-info": "rgb(56 189 248 / <alpha-value>)",
        "status-warn": "rgb(251 191 36 / <alpha-value>)",
        "status-error": "rgb(248 113 113 / <alpha-value>)",
      },
      borderRadius: {
        xl: "24px",
        lg: "16px",
      },
      boxShadow: {
        panel: "0 20px 60px rgba(0,0,0,0.35)",
        glow: "0 0 0 1px rgba(79,240,198,0.45), 0 12px 40px rgba(79,240,198,0.25)",
        soft: "0 20px 80px rgba(159,123,255,0.25)",
      },
      backgroundImage: {
        "noise":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.10'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulse: {
          "0%, 100%": { opacity: "0.65" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        float: "float 9s ease-in-out infinite",
        pulse: "pulse 6s ease-in-out infinite",
      },
      transitionTimingFunction: {
        snap: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
