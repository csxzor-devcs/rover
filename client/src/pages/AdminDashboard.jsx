// ─── Admin Dashboard v2 — Mission-Based Delivery Control ──────────

import { useState, useEffect, useCallback } from 'react';
import StatusBadge from '../components/shared/StatusBadge';
import LogViewer from '../components/shared/LogViewer';

import * as api from '../api/roverApi';

const POLL_INTERVAL = 1200;

// ─── Room presets for quick dispatch
const ROOM_PRESETS = ['101', '102', '203', '305', '410', '512'];

export default function AdminDashboard() {
    const [status, setStatus] = useState(null);
    const [logs, setLogs] = useState([]);
    const [history, setHistory] = useState([]);
    const [missionHist, setMissionHist] = useState([]);
    const [room, setRoom] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        try {
            const [s, l, h, mh] = await Promise.all([
                api.getRoverStatus(),
                api.getLogs({ limit: 80 }),
                api.getStateHistory(15),
                api.getMissionHistory(10),
            ]);
            setStatus(s);
            setLogs(l.logs);
            setHistory(h.history);
            setMissionHist(mh.missions);
            setError(null);
        } catch {
            setError('Cannot connect to rover backend');
        }
    }, []);

    useEffect(() => {
        fetchAll();
        const iv = setInterval(fetchAll, POLL_INTERVAL);
        return () => clearInterval(iv);
    }, [fetchAll]);

    const doAction = async (fn) => {
        setLoading(true);
        try { await fn(); await fetchAll(); setError(null); }
        catch (e) { setError(e.error || 'Action failed'); }
        setLoading(false);
    };

    if (!status) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-zephyra-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-zephyra-muted text-sm font-mono">Connecting to rover...</p>
                    {error && <p className="text-zephyra-red text-xs mt-2">{error}</p>}
                </div>
            </div>
        );
    }

    const mission = status.mission;
    const isIdle = status.state === 'IDLE';
    const isManual = status.state === 'MANUAL_CONTROL';

    return (
        <div className="p-4 lg:p-6 space-y-4 max-w-[1600px] mx-auto">
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* ─── Top Bar ─── */}
            <div className="flex flex-wrap items-center gap-4">
                <StatusBadge state={status.state} size="lg" />
                {mission && (
                    <div className="flex items-center gap-3 ml-4">
                        <span className="text-xs font-mono text-zephyra-muted">ROOM</span>
                        <span className="text-lg font-bold text-zephyra-cyan font-mono">{mission.room}</span>
                        <div className="w-32 h-2 bg-zephyra-bg rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-zephyra-cyan rounded-full transition-all duration-700"
                                style={{ width: `${mission.progress || 0}%` }}
                            />
                        </div>
                        <span className="text-xs font-mono text-zephyra-cyan">{mission.progress || 0}%</span>
                    </div>
                )}
                <div className="ml-auto flex gap-2">
                    <button onClick={() => doAction(api.resetRover)} className="btn-ghost text-xs" disabled={loading}>
                        ⟲ Reset
                    </button>
                </div>
            </div>

            {/* ─── Main Grid ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* ── Column 1: Mission Dispatch + Manual Override ── */}
                <div className="space-y-4">
                    {/* Mission Dispatch */}
                    <div className="panel space-y-3">
                        <div className="panel-header">Mission Dispatch</div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Room #"
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                                className="flex-1 bg-zephyra-bg border border-zephyra-border rounded-lg px-3 py-2 text-sm font-mono text-zephyra-text placeholder:text-zephyra-muted/50 focus:outline-none focus:border-zephyra-cyan transition-colors"
                                id="room-input"
                            />
                            <button
                                onClick={() => doAction(() => api.startMission(room))}
                                disabled={loading || !room.trim() || !isIdle}
                                className="btn-primary text-xs whitespace-nowrap"
                                id="btn-start-mission"
                            >
                                🚀 Start Delivery
                            </button>
                        </div>
                        {/* Room presets */}
                        <div className="flex flex-wrap gap-1.5">
                            {ROOM_PRESETS.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRoom(r)}
                                    className={`px-2 py-1 rounded text-[11px] font-mono transition-all ${room === r
                                        ? 'bg-zephyra-cyan text-zephyra-bg'
                                        : 'bg-zephyra-bg text-zephyra-muted hover:text-zephyra-text border border-zephyra-border'
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                        {!isIdle && !isManual && (
                            <div className="text-[10px] text-zephyra-amber font-mono">⚠ Mission in progress — dispatch disabled</div>
                        )}
                    </div>

                    {/* Live Mission Tracker */}
                    {mission && (
                        <div className="panel space-y-3">
                            <div className="panel-header">Active Mission</div>
                            <div className="space-y-2">
                                {[
                                    { label: 'Started', time: mission.startTime, done: true },
                                    { label: 'Arriving', time: mission.arrivalTime, done: !!mission.arrivalTime },
                                    { label: 'User Notified', time: mission.waitStartTime, done: !!mission.waitStartTime },
                                    { label: 'Opened', time: mission.openedTime, done: !!mission.openedTime },
                                    { label: 'Completed', time: mission.completedTime, done: !!mission.completedTime },
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${step.done ? 'bg-zephyra-cyan text-zephyra-bg' : 'bg-zephyra-surface-light text-zephyra-muted'
                                            }`}>
                                            {step.done ? '✓' : i + 1}
                                        </div>
                                        <span className={`text-xs ${step.done ? 'text-zephyra-text' : 'text-zephyra-muted/50'}`}>
                                            {step.label}
                                        </span>
                                        {step.time && (
                                            <span className="text-[10px] font-mono text-zephyra-muted ml-auto">
                                                {new Date(step.time).toLocaleTimeString()}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>


                {/* ── Column 2: Rover Status + Motors ── */}
                <div className="space-y-4">
                    {/* Rover Status */}
                    <div className="panel space-y-3">
                        <div className="panel-header">Rover Status</div>
                        <div className="text-center py-3">
                            <StatusBadge state={status.state} size="lg" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                            <div className="bg-zephyra-bg rounded-lg p-2.5">
                                <div className="text-zephyra-muted text-[10px] mb-1">PAYLOAD</div>
                                <div className={`font-semibold ${status.payload?.locked ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {status.payload?.locked ? '🔒 Locked' : '🔓 Unlocked'}
                                </div>
                            </div>
                            <div className="bg-zephyra-bg rounded-lg p-2.5">
                                <div className="text-zephyra-muted text-[10px] mb-1">MISSION</div>
                                <div className="text-zephyra-text font-semibold">
                                    {mission ? `Room ${mission.room}` : 'None'}
                                </div>
                            </div>
                        </div>

                        {/* State History */}
                        <div className="border-t border-zephyra-border pt-3 mt-2">
                            <div className="text-[10px] font-mono text-zephyra-muted uppercase mb-2">Recent Transitions</div>
                            <div className="space-y-0.5 max-h-[150px] overflow-y-auto">
                                {history.slice(0, 8).map((h, i) => (
                                    <div key={i} className="flex items-center gap-1.5 text-[10px] font-mono py-0.5">
                                        <span className="text-zephyra-muted min-w-[48px]">
                                            {new Date(h.timestamp).toLocaleTimeString()}
                                        </span>
                                        <span className="text-zephyra-muted">{h.from || '—'}</span>
                                        <span className="text-zephyra-cyan">→</span>
                                        <span className="text-zephyra-text">{h.to}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>


                </div>

                {/* ── Column 3: Logs + Mission History ── */}
                <div className="space-y-4">
                    {/* Log Stream */}
                    <div className="panel h-[350px] flex flex-col">
                        <div className="panel-header">Log Stream</div>
                        <div className="flex-1 min-h-0">
                            <LogViewer logs={logs} onClear={() => doAction(api.clearLogs)} />
                        </div>
                    </div>

                    {/* Mission History */}
                    <div className="panel">
                        <div className="panel-header">Mission History</div>
                        {missionHist.length === 0 ? (
                            <div className="text-center py-4 text-xs text-zephyra-muted">No completed missions</div>
                        ) : (
                            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                                {missionHist.map((m) => (
                                    <div key={m.missionId} className="flex items-center gap-2 text-[11px] font-mono bg-zephyra-bg rounded-lg px-3 py-2">
                                        <span className={`w-2 h-2 rounded-full ${m.status === 'COMPLETED' ? 'bg-emerald-500' :
                                            m.status === 'RETURNED' ? 'bg-amber-500' : 'bg-red-500'
                                            }`} />
                                        <span className="text-zephyra-text font-semibold">Room {m.room}</span>
                                        <span className="text-zephyra-muted ml-auto">
                                            {m.status}
                                        </span>
                                        <span className="text-zephyra-muted/50 text-[10px]">
                                            {new Date(m.startTime).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </div >
    );
}
