import type { Config as TwConfig } from "tailwindcss";
const plugin = require("tailwindcss/plugin");

export default function config(app?: "storefront" | "stripe") {
  const config = {
    content: [
      `../../apps/${app}/src/index.html`,
      `../../apps/${app}/src/**/*.{ts,tsx,html,stories.tsx}`,
      "../../packages/ui/src/**/*.{ts,tsx,html,stories.tsx}",
      "../../interface/**/*.{ts,tsx,html,stories.tsx}",
    ],
    darkMode: ["class"],
    theme: {
      screens: {
        xs: "360px",
        sm: "720px",
        md: "960px",
        lg: "1140px",
        xl: "1440px",
      },
      fontSize: {
        tiny: ".625rem",
        xs: ".75rem",
        sm: ".875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        "6xl": "3.75rem",
        "7xl": "4.5rem",
        "8xl": "6rem",
        "9xl": "8rem",
      },
      container: {
        center: true,
        padding: "1rem",
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
        },
      },
      extend: {
        colors: {
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          primary: {
            DEFAULT: "hsl(var(--primary))",
            foreground: "hsl(var(--primary-foreground))",
          },
          secondary: {
            DEFAULT: "hsl(var(--secondary))",
            foreground: "hsl(var(--secondary-foreground))",
          },
          destructive: {
            DEFAULT: "hsl(var(--destructive))",
            foreground: "hsl(var(--destructive-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--muted))",
            foreground: "hsl(var(--muted-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--accent))",
            foreground: "hsl(var(--accent-foreground))",
          },
          popover: {
            DEFAULT: "hsl(var(--popover))",
            foreground: "hsl(var(--popover-foreground))",
          },
          card: {
            DEFAULT: "hsl(var(--card))",
            foreground: "hsl(var(--card-foreground))",
          },
          error: "hsl(var(--error))",
        },
        borderRadius: {
          DEFAULT: "var(--radius)",
          xxxl: "calc(var(--radius) + 20px)",
          xxl: "calc(var(--radius) + 12px)",
          xl: "calc(var(--radius) + 8px)",
          lg: "calc(var(--radius) + 4px)",
          md: "calc(var(--radius) + 2px)",
          sm: "calc(var(--radius) - 2px)",
        },
        zIndex: {
          51: "51",
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
      require("@tailwindcss/typography"),
      plugin(function ({ addUtilities }: any) {
        addUtilities({
          ".no-scrollbar": {
            "-ms-overflow-style": "none",
            "scrollbar-width": "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          },
        });
      }),
    ],
  } satisfies TwConfig;

  return config;
}
