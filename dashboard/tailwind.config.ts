import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { display: ['Cormorant Garamond', 'serif'], body: ['IBM Plex Sans', 'sans-serif'], mono: ['IBM Plex Mono', 'monospace'] },
      colors: { ink: 'var(--bg-primary)', surface: 'var(--bg-surface)', accent: 'var(--accent)', approve: 'var(--verdict-approve)', refund: 'var(--verdict-refund)' },
    },
  },
  plugins: [],
} satisfies Config
