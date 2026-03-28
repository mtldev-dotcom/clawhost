import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // NestAI Brand Colors
      colors: {
        // Brand primitives
        ink: '#0A0A0A',
        chalk: '#F7F7F5',
        surface: '#141414',
        subtle: '#E8E8E4',
        emerald: {
          DEFAULT: '#1D9E75',
          light: '#E8F5F0',
          dark: '#0F6E56',
          subtle: '#D1FAE5', // hover state
        },

        // shadcn/ui compatibility (mapped to brand)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },

      // Brand Typography
      fontFamily: {
        sans: ['var(--font-geist)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['32px', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '500' }],
        'heading': ['22px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '500' }],
        'body': ['16px', { lineHeight: '1.7', letterSpacing: '0' }],
        'label': ['12px', { lineHeight: '1.4', letterSpacing: '0.07em' }],
      },

      // Brand Spacing (extends default)
      spacing: {
        '18': '72px',
      },

      // Brand Border Radius
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        'pill': '20px',
      },

      // Brand Transitions
      transitionDuration: {
        DEFAULT: '150ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease',
      },

      // Content width
      maxWidth: {
        'content': '72rem',
      },

      // Min height for tap targets
      minHeight: {
        'tap': '44px',
      },
    },
  },
  plugins: [],
}

export default config
