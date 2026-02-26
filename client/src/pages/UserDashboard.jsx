// ─── User Dashboard v2 — Delivery Experience ──────────────────────
// The user sees this as a delivery notification & interaction screen.

import { useState, useEffect, useCallback, useRef } from 'react';
import StatusBadge from '../components/shared/StatusBadge';
import * as api from '../api/roverApi';

const POLL_INTERVAL = 1500;

const DELIVERY_MESSAGES = {
    IDLE: { title: 'No Active Delivery', subtitle: 'You will be notified when a delivery is on the way.', icon: '📭' },
    NAVIGATING: { title: 'Delivery En Route', subtitle: 'Your rover is navigating to your room.', icon: '🚀' },
    ARRIVED: { title: 'Rover Has Arrived', subtitle: 'The rover is at your door.', icon: '📍' },
    WAITING_FOR_USER: { title: 'Open Your Compartment', subtitle: 'The rover is waiting for you to collect your delivery.', icon: '🔔' },
    DELIVERY_WINDOW: { title: 'Compartment Open', subtitle: 'Collect your items and press close when done.', icon: '📦' },
    RETURNING_HOME: { title: 'Rover Returning', subtitle: 'The rover is heading back to base.', icon: '🏠' },
    MANUAL_CONTROL: { title: 'Under Manual Control', subtitle: 'An operator is controlling the rover.', icon: '🎮' },
    COMPLETED: { title: 'Delivery Complete!', subtitle: 'Your delivery was successful. Thank you!', icon: '✅' },
    ERROR: { title: 'Something Went Wrong', subtitle: 'Please contact the building administrator.', icon: '⚠️' },
};

export default function UserDashboard() {
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const countdownRef = useRef(null);

    const fetchStatus = useCallback(async () => {
        try {
            const s = await api.getRoverStatus();
            setStatus(s);
            setError(null);
        } catch {
            setError('Unable to connect');
        }
    }, []);

    useEffect(() => {
        fetchStatus();
        const iv = setInterval(fetchStatus, POLL_INTERVAL);
        return () => clearInterval(iv);
    }, [fetchStatus]);

    // Countdown timer for WAITING_FOR_USER
    useEffect(() => {
        if (status?.state === 'WAITING_FOR_USER' && status?.mission?.waitStartTime) {
            const timeout = (status.mission.timeoutSeconds || 120) * 1000;
            const startTime = new Date(status.mission.waitStartTime).getTime();

            const tick = () => {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, Math.ceil((timeout - elapsed) / 1000));
                setCountdown(remaining);
                if (remaining <= 0) clearInterval(countdownRef.current);
            };

            tick();
            countdownRef.current = setInterval(tick, 1000);
            return () => clearInterval(countdownRef.current);
        } else {
            setCountdown(null);
        }
    }, [status?.state, status?.mission?.waitStartTime]);

    const doAction = async (fn) => {
        try { await fn(); await fetchStatus(); }
        catch (e) { setError(e.error || 'Action failed'); }
    };

    if (!status) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-FAB_05-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-FAB_05-muted text-sm font-mono">Connecting...</p>
                </div>
            </div>
        );
    }

    const msg = DELIVERY_MESSAGES[status.state] || DELIVERY_MESSAGES.IDLE;
    const mission = status.mission;
    const isWaiting = status.state === 'WAITING_FOR_USER';
    const isOpen = status.state === 'DELIVERY_WINDOW';
    const isIdle = status.state === 'IDLE';
    const isNavigating = status.state === 'NAVIGATING';

    return (
        <div className="p-4 lg:p-6 max-w-lg mx-auto space-y-5 min-h-[80vh] flex flex-col justify-center">

            {/* ─── Main Delivery Card ─── */}
            <div className="panel text-center space-y-5 py-10 relative overflow-hidden">
                {/* Background glow for active states */}
                {!isIdle && (
                    <div className="absolute inset-0 bg-gradient-to-b from-FAB_05-cyan/5 to-transparent pointer-events-none" />
                )}

                <div className="relative">
                    <div className="text-5xl mb-4">{msg.icon}</div>
                    <h2 className="text-xl font-semibold text-FAB_05-text mb-2">{msg.title}</h2>
                    <p className="text-sm text-FAB_05-muted max-w-xs mx-auto">{msg.subtitle}</p>

                    {mission && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-FAB_05-bg rounded-full px-4 py-1.5">
                            <span className="text-xs font-mono text-FAB_05-muted">Room</span>
                            <span className="text-sm font-mono font-bold text-FAB_05-cyan">{mission.room}</span>
                        </div>
                    )}
                </div>

                <StatusBadge state={status.state} size="md" />
            </div>

            {/* ─── Navigation Progress ─── */}
            {isNavigating && mission && (
                <div className="panel space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-FAB_05-muted">En Route</span>
                        <span className="text-sm font-mono font-bold text-blue-400">{mission.progress || 0}%</span>
                    </div>
                    <div className="h-2.5 bg-FAB_05-bg rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-400 to-FAB_05-cyan transition-all duration-1000 relative"
                            style={{ width: `${mission.progress || 0}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse" />
                        </div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-FAB_05-muted">
                        <span>Base</span>
                        <span>Room {mission.room}</span>
                    </div>
                </div>
            )}

            {/* ─── Countdown Timer ─── */}
            {isWaiting && countdown !== null && (
                <div className="panel text-center py-6 space-y-3">
                    <div className="text-[10px] font-mono text-FAB_05-muted uppercase tracking-widest">Time Remaining</div>
                    <div className={`text-4xl font-mono font-bold ${countdown <= 30 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                        {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                    </div>
                    <div className="h-1.5 bg-FAB_05-bg rounded-full overflow-hidden max-w-[200px] mx-auto">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${countdown <= 30 ? 'bg-red-500' : 'bg-amber-500'}`}
                            style={{ width: `${(countdown / (status.mission?.timeoutSeconds || 120)) * 100}%` }}
                        />
                    </div>
                    <p className="text-[11px] text-FAB_05-muted">
                        Rover will return to base if not opened in time
                    </p>
                </div>
            )}

            {/* ─── Open Compartment Button ─── */}
            {isWaiting && (
                <button
                    onClick={() => doAction(api.openCompartment)}
                    className="w-full py-5 rounded-xl text-lg font-semibold transition-all duration-300
            bg-gradient-to-r from-emerald-500/20 to-cyan-500/20
            border-2 border-emerald-500/40
            text-emerald-400 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10
            active:scale-[0.98] flex items-center justify-center gap-3"
                    id="btn-open-compartment"
                >
                    <span className="text-2xl">🔓</span>
                    <span>Open Compartment</span>
                </button>
            )}

            {/* ─── Close Compartment Button ─── */}
            {isOpen && (
                <button
                    onClick={() => doAction(api.closeCompartment)}
                    className="w-full py-5 rounded-xl text-lg font-semibold transition-all duration-300
            bg-gradient-to-r from-cyan-500/20 to-blue-500/20
            border-2 border-cyan-500/40
            text-cyan-400 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10
            active:scale-[0.98] flex items-center justify-center gap-3"
                    id="btn-close-compartment"
                >
                    <span className="text-2xl">🔒</span>
                    <span>Done — Close Compartment</span>
                </button>
            )}

            {/* ─── Redelivery Button ─── */}
            {isIdle && (
                <button
                    onClick={() => doAction(api.requestRedelivery)}
                    className="w-full py-4 rounded-xl text-sm font-medium transition-all duration-300
            bg-FAB_05-surface border border-FAB_05-border
            text-FAB_05-muted hover:text-FAB_05-text hover:border-FAB_05-cyan/30
            active:scale-[0.98] flex items-center justify-center gap-2"
                    id="btn-redelivery"
                >
                    <span>🔄</span>
                    <span>Request Redelivery</span>
                </button>
            )}

            {/* ─── Error Display ─── */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 text-xs text-center">
                    {error}
                </div>
            )}

            {/* ─── Footer ─── */}
            <div className="text-center text-[10px] font-mono text-FAB_05-muted/40 mt-auto pt-4">
                FAB_05 Delivery System · Simulation Mode
            </div>
        </div>
    );
}

