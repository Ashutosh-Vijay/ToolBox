/** @type {import('tailwindcss').Config} */
// The hand-authored design system in src/styles.css is the source of truth for
// the look. Tailwind is wired up for one-off utility tweaks; the design tokens
// are exposed here so utilities can reference them if ever needed.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  // The design system owns the reset; don't let Tailwind's preflight override it.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        accent: "var(--accent)",
        "bg-0": "var(--bg-0)",
        "bg-1": "var(--bg-1)",
        "bg-2": "var(--bg-2)",
        "bg-3": "var(--bg-3)",
        "text-0": "var(--text-0)",
        "text-1": "var(--text-1)",
        "text-2": "var(--text-2)",
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
