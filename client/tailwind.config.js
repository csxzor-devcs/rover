/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                'FAB_05-bg': '#0a0e17',
                'FAB_05-surface': '#111827',
                'FAB_05-surface-light': '#1f2937',
                'FAB_05-border': '#374151',
                'FAB_05-cyan': '#22d3ee',
                'FAB_05-cyan-dim': '#164e63',
                'FAB_05-green': '#10b981',
                'FAB_05-amber': '#f59e0b',
                'FAB_05-red': '#ef4444',
                'FAB_05-purple': '#a78bfa',
                'FAB_05-text': '#e5e7eb',
                'FAB_05-muted': '#6b7280',
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

