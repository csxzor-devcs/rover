// ─── FAB_05 v2 — In-Memory Store ─────────────────────────────────
// Central data store for rover state and state history.

const { STATES } = require('../rover/stateMachine');

let store = {
    roverState: STATES.IDLE,
    stateHistory: [
        { from: null, to: STATES.IDLE, command: 'INIT', timestamp: new Date().toISOString() },
    ],
};

function getRoverState() {
    return store.roverState;
}

function setRoverState(newState) {
    store.roverState = newState;
}

function addStateHistory(from, to, command) {
    store.stateHistory.unshift({
        from, to, command,
        timestamp: new Date().toISOString(),
    });
    if (store.stateHistory.length > 200) store.stateHistory.pop();
}

function getStateHistory(limit = 50) {
    return store.stateHistory.slice(0, limit);
}

function resetStore() {
    store.roverState = STATES.IDLE;
    store.stateHistory = [
        { from: null, to: STATES.IDLE, command: 'INIT', timestamp: new Date().toISOString() },
    ];
}

module.exports = {
    getRoverState, setRoverState,
    addStateHistory, getStateHistory,
    resetStore,
};

