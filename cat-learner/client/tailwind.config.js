/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        vi:   ['"Noto Sans"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      colors: {
        'ds-bg':          'var(--ds-bg)',
        'ds-surface':     'var(--ds-surface)',
        'ds-surface-hi':  'var(--ds-surface-hi)',
        'ds-accent':      'var(--ds-accent)',
        'ds-accent-lt':   'var(--ds-accent-lt)',
        'ds-accent-sub':  'var(--ds-accent-sub)',
        'ds-border':      'var(--ds-border)',
        'ds-text':        'var(--ds-text)',
        'ds-text-muted':  'var(--ds-text-muted)',
        'ds-text-ghost':  'var(--ds-text-ghost)',
        'ds-correct':     'var(--ds-correct)',
        'ds-error':       'var(--ds-error)',
        'ds-warn':        'var(--ds-warn)',
      },
      keyframes: {
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%':     { transform: 'translateX(-6px)' },
          '40%':     { transform: 'translateX(6px)' },
          '60%':     { transform: 'translateX(-4px)' },
          '80%':     { transform: 'translateX(4px)' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shake:  'shake 0.5s ease-in-out',
        fadeIn: 'fadeIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
