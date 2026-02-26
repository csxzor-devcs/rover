// ─── LogViewer ─────────────────────────────────────────────────────
// Scrollable log stream with level-based coloring and filtering.

import { useState, useEffect, useRef } from 'react';

const LEVEL_STYLES = {
    INFO: 'text-zephyra-cyan',
    WARN: 'text-zephyra-amber',
    ERROR: 'text-zephyra-red',
    COMMAND: 'text-zephyra-purple',
};

const LEVEL_BG = {
    INFO: 'bg-cyan-500/10',
    WARN: 'bg-amber-500/10',
    ERROR: 'bg-red-500/10',
    COMMAND: 'bg-violet-500/10',
};

export default function LogViewer({ logs = [], onClear }) {
    const [filter, setFilter] = useState('ALL');
    const scrollRef = useRef(null);

    const filtered = filter === 'ALL' ? logs : logs.filter((l) => l.level === filter);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [logs.length]);

    return (
        <div className="flex flex-col h-full">
            {/* Filters */}
            <div className="flex items-center gap-1 mb-2 flex-wrap">
                {['ALL', 'INFO', 'WARN', 'ERROR', 'COMMAND'].map((level) => (
                    <button
                        key={level}
                        onClick={() => setFilter(level)}
                        className={`
              px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-all
              ${filter === level
                                ? 'bg-zephyra-cyan text-zephyra-bg'
                                : 'bg-zephyra-surface-light text-zephyra-muted hover:text-zephyra-text'
                            }
            `}
                    >
                        {level}
                    </button>
                ))}
                {onClear && (
                    <button onClick={onClear} className="ml-auto text-[10px] text-zephyra-muted hover:text-zephyra-red transition-colors">
                        Clear
                    </button>
                )}
            </div>

            {/* Log entries */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-0.5 font-mono text-xs min-h-0">
                {filtered.length === 0 ? (
                    <div className="text-zephyra-muted text-center py-8 text-xs">No logs</div>
                ) : (
                    filtered.map((log) => (
                        <div
                            key={log.id}
                            className={`flex items-start gap-2 px-2 py-1 rounded ${LEVEL_BG[log.level]} transition-all`}
                        >
                            <span className={`${LEVEL_STYLES[log.level]} font-semibold min-w-[52px]`}>
                                [{log.level}]
                            </span>
                            <span className="text-zephyra-muted min-w-[64px] shrink-0">
                                {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <span className="text-zephyra-text flex-1">{log.message}</span>
                            <span className="text-zephyra-muted/50 text-[10px]">{log.source}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
