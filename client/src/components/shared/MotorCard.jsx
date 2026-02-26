// ─── MotorCard ─────────────────────────────────────────────────────
// Single motor status card with animated speed gauge.

const DIR_ICONS = { FORWARD: '▲', BACKWARD: '▼', STOPPED: '■' };
const DIR_COLORS = {
    FORWARD: 'text-emerald-400',
    BACKWARD: 'text-blue-400',
    STOPPED: 'text-zephyra-muted',
};
const STATUS_COLORS = {
    OK: 'bg-emerald-500',
    WARNING: 'bg-amber-500',
    FAULT: 'bg-red-500',
};

export default function MotorCard({ motor }) {
    const speedPercent = Math.round((motor.speed / 255) * 100);

    return (
        <div className={`
      panel flex flex-col gap-2 relative overflow-hidden
      ${motor.status === 'FAULT' ? 'border-red-500/50' : ''}
    `}>
            {/* Status dot */}
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zephyra-muted uppercase tracking-wider">
                    {motor.label}
                </span>
                <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[motor.status]}`} />
            </div>

            {/* Speed gauge */}
            <div className="flex items-center gap-2">
                <span className={`text-lg ${DIR_COLORS[motor.direction]}`}>
                    {DIR_ICONS[motor.direction]}
                </span>
                <div className="flex-1">
                    <div className="h-1.5 bg-zephyra-bg rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ease-out ${motor.direction === 'FORWARD' ? 'bg-emerald-500' :
                                    motor.direction === 'BACKWARD' ? 'bg-blue-500' : 'bg-gray-600'
                                }`}
                            style={{ width: `${speedPercent}%` }}
                        />
                    </div>
                </div>
                <span className="text-xs font-mono text-zephyra-text min-w-[36px] text-right">
                    {motor.speed}
                </span>
            </div>

            {/* Bank label */}
            <div className="text-[9px] font-mono text-zephyra-muted/50 uppercase">
                {motor.bank} Bank · M{motor.id}
            </div>
        </div>
    );
}
