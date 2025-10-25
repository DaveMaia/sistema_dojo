import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0ea5e9',
        success: '#22c55e',
        warning: '#facc15',
        danger: '#ef4444',
        muted: '#1f2937',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
