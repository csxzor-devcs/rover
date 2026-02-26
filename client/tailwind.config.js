/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                'zephyra-bg': '#0a0e17',
                'zephyra-surface': '#111827',
                'zephyra-surface-light': '#1f2937',
                'zephyra-border': '#374151',
                'zephyra-cyan': '#22d3ee',
                'zephyra-cyan-dim': '#164e63',
                'zephyra-green': '#10b981',
                'zephyra-amber': '#f59e0b',
                'zephyra-red': '#ef4444',
                'zephyra-purple': '#a78bfa',
                'zephyra-text': '#e5e7eb',
                'zephyra-muted': '#6b7280',
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
                sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(34, 211, 238, 0.3)' },
                    '100%': { boxShadow: '0 0 20px rgba(34, 211, 238, 0.6)' },
                },
            },
        },
    },
    plugins: [],
};
