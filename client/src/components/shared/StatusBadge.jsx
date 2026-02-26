// ─── StatusBadge v2 — Delivery States ──────────────────────────────

const STATE_STYLES = {
    IDLE: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', glow: '' },
    NAVIGATING: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'shadow-blue-500/20 shadow-lg' },
    ARRIVED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20 shadow-lg' },
    WAITING_FOR_USER: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'shadow-amber-500/20 shadow-lg animate-pulse' },
    DELIVERY_WINDOW: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/20 shadow-lg' },
    RETURNING_HOME: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30', glow: 'shadow-indigo-500/20 shadow-lg' },
    MANUAL_CONTROL: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', glow: 'shadow-orange-500/20 shadow-lg animate-pulse' },
    COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', glow: 'shadow-green-500/20 shadow-lg' },
    ERROR: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', glow: 'shadow-red-500/20 shadow-lg animate-pulse' },
};

const STATE_ICONS = {
    IDLE: '●',
    NAVIGATING: '🚀',
    ARRIVED: '📍',
    WAITING_FOR_USER: '🔔',
    DELIVERY_WINDOW: '📦',
    RETURNING_HOME: '🏠',
    MANUAL_CONTROL: '🎮',
    COMPLETED: '✓',
    ERROR: '✕',
};

const STATE_LABELS = {
    IDLE: 'IDLE',
    NAVIGATING: 'NAVIGATING',
    ARRIVED: 'ARRIVED',
    WAITING_FOR_USER: 'WAITING',
    DELIVERY_WINDOW: 'OPEN',
    RETURNING_HOME: 'RETURNING',
    MANUAL_CONTROL: 'MANUAL',
    COMPLETED: 'COMPLETED',
    ERROR: 'ERROR',
};

export default function StatusBadge({ state, size = 'md' }) {
    const style = STATE_STYLES[state] || STATE_STYLES.IDLE;
    const icon = STATE_ICONS[state] || '?';
    const label = STATE_LABELS[state] || state;

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-5 py-2.5 text-base',
        xl: 'px-6 py-3 text-lg',
    };

    return (
        <span className={`
      inline-flex items-center gap-2 rounded-full font-mono font-medium border
      transition-all duration-300
      ${style.bg} ${style.text} ${style.border} ${style.glow}
      ${sizes[size]}
    `}>
            <span>{icon}</span>
            <span>{label}</span>
        </span>
    );
}
