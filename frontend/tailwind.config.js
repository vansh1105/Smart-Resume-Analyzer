/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        foreground: '#fafafa',
        card: {
          DEFAULT: '#18181b',
          foreground: '#fafafa',
          hover: '#202024',
        },
        popover: {
          DEFAULT: '#09090b',
          foreground: '#fafafa',
        },
        primary: {
          DEFAULT: '#ffffff',
          foreground: '#09090b',
        },
        secondary: {
          DEFAULT: '#27272a',
          foreground: '#fafafa',
        },
        muted: {
          DEFAULT: '#27272a',
          foreground: '#a1a1aa',
        },
        accent: {
          DEFAULT: '#f4f4f5',
          foreground: '#09090b',
          purple: '#8b5cf6',
          blue: '#3b82f6',
          green: '#10b981',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#fafafa',
        },
        border: '#27272a',
        input: '#27272a',
        ring: '#d4d4d8',
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
