// ─── FAB_05 Payload Simulator ─────────────────────────────────────
// Simulates the rover's payload compartment lock mechanism.

let payload = {
    locked: true,
    openedAt: null,
    closedAt: null,
};

function unlock() {
    payload.locked = false;
    payload.openedAt = new Date().toISOString();
    payload.closedAt = null;
    return getStatus();
}

function lock() {
    payload.locked = true;
    payload.closedAt = new Date().toISOString();
    return getStatus();
}

function getStatus() {
    return { ...payload };
}

function reset() {
    payload = { locked: true, openedAt: null, closedAt: null };
    return getStatus();
}

module.exports = { unlock, lock, getStatus, reset };

