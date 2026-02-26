// ─── FAB_05 v2 — Mission Simulator Orchestrator ──────────────────
// Wires state machine + mission service + motors + payload + logs.
// Handles the complete delivery lifecycle with auto-progress simulation.

const { transition, getValidCommands, STATES, COMMANDS } = require('./stateMachine');
const { setMotors, stopAll, getMotors, resetMotors } = require('./motorSimulator');
const payload = require('./payloadSimulator');
const { addLog } = require('../services/logService');
const store = require('../services/store');
const mission = require('../services/missionService');

let navigationTimer = null;
let waitingTimer = null;

// ── Mission Operations ──────────────────────────────

function startMission(room) {
    const currentState = store.getRoverState();
    if (currentState !== STATES.IDLE) {
        return { success: false, error: `Cannot start mission: rover is ${currentState}` };
    }

    const result = transition(currentState, COMMANDS.START_MISSION);
    if (!result.valid) return { success: false, error: result.error };

    store.setRoverState(result.newState);
    store.addStateHistory(currentState, result.newState, COMMANDS.START_MISSION);

    const m = mission.createMission(room);
    setMotors('FORWARD', 100);

    addLog('COMMAND', `Mission started → Room ${room}`, 'MISSION');
    addLog('INFO', `State: ${currentState} → ${result.newState}`, 'STATE_MACHINE');

    // Start auto-progress simulation
    startNavigationSimulation();

    return { success: true, state: result.newState, mission: m };
}

function startNavigationSimulation() {
    clearInterval(navigationTimer);
    let progress = 0;
    navigationTimer = setInterval(() => {
        progress += Math.random() * 8 + 2; // 2-10% per tick
        if (progress >= 100) {
            progress = 100;
            clearInterval(navigationTimer);
            navigationTimer = null;
            // Auto-arrive
            simulateArrival();
        }
        mission.updateProgress(Math.round(progress));
    }, 1500);
}

function simulateArrival() {
    const currentState = store.getRoverState();
    if (currentState !== STATES.NAVIGATING) return;

    // NAVIGATING → ARRIVED
    const r1 = transition(currentState, COMMANDS.ARRIVE);
    if (!r1.valid) return;
    store.setRoverState(r1.newState);
    store.addStateHistory(currentState, r1.newState, COMMANDS.ARRIVE);
    stopAll();

    mission.updateMissionStatus('ARRIVED');
    addLog('INFO', `Rover arrived at Room ${mission.getActiveMission()?.room}`, 'NAVIGATION');
    addLog('INFO', `State: ${currentState} → ${r1.newState}`, 'STATE_MACHINE');

    // ARRIVED → WAITING_FOR_USER (auto)
    const r2 = transition(r1.newState, COMMANDS.NOTIFY_USER);
    if (r2.valid) {
        store.setRoverState(r2.newState);
        store.addStateHistory(r1.newState, r2.newState, COMMANDS.NOTIFY_USER);
        mission.updateMissionStatus('WAITING');
        addLog('INFO', 'User notified — waiting for compartment open', 'MISSION');
        addLog('INFO', `State: ${r1.newState} → ${r2.newState}`, 'STATE_MACHINE');

        // Start timeout countdown
        startWaitingTimeout();
    }
}

function startWaitingTimeout() {
    clearTimeout(waitingTimer);
    const m = mission.getActiveMission();
    const timeout = (m?.timeoutSeconds || 120) * 1000;

    waitingTimer = setTimeout(() => {
        const currentState = store.getRoverState();
        if (currentState !== STATES.WAITING_FOR_USER) return;

        const result = transition(currentState, COMMANDS.TIMEOUT);
        if (!result.valid) return;

        store.setRoverState(result.newState);
        store.addStateHistory(currentState, result.newState, COMMANDS.TIMEOUT);
        mission.updateMissionStatus('RETURNED');
        setMotors('BACKWARD', 80);

        addLog('WARN', 'User timeout — rover returning to base', 'MISSION');
        addLog('INFO', `State: ${currentState} → ${result.newState}`, 'STATE_MACHINE');

        // Simulate return trip
        setTimeout(() => {
            const s = store.getRoverState();
            if (s !== STATES.RETURNING_HOME) return;
            const r = transition(s, COMMANDS.ARRIVE);
            if (r.valid) {
                store.setRoverState(r.newState);
                store.addStateHistory(s, r.newState, COMMANDS.ARRIVE);
                stopAll();
                mission.completeMission();
                addLog('INFO', 'Rover returned to base', 'NAVIGATION');
            }
        }, 8000);
    }, timeout);
}

function openCompartment() {
    const currentState = store.getRoverState();
    const result = transition(currentState, COMMANDS.OPEN_COMPARTMENT);
    if (!result.valid) return { success: false, error: result.error };

    clearTimeout(waitingTimer);
    store.setRoverState(result.newState);
    store.addStateHistory(currentState, result.newState, COMMANDS.OPEN_COMPARTMENT);

    payload.unlock();
    mission.updateMissionStatus('DELIVERED');

    addLog('COMMAND', 'Compartment opened by user', 'PAYLOAD');
    addLog('INFO', `State: ${currentState} → ${result.newState}`, 'STATE_MACHINE');

    return { success: true, state: result.newState, payload: payload.getStatus() };
}

function closeCompartment() {
    const currentState = store.getRoverState();
    const result = transition(currentState, COMMANDS.CLOSE_COMPARTMENT);
    if (!result.valid) return { success: false, error: result.error };

    store.setRoverState(result.newState);
    store.addStateHistory(currentState, result.newState, COMMANDS.CLOSE_COMPARTMENT);

    payload.lock();
    mission.updateMissionStatus('COMPLETED');
    const completedMission = mission.completeMission();

    addLog('COMMAND', 'Compartment closed — delivery complete', 'PAYLOAD');
    addLog('INFO', `State: ${currentState} → ${result.newState}`, 'STATE_MACHINE');

    // Auto-reset to IDLE after brief delay
    setTimeout(() => {
        const s = store.getRoverState();
        if (s === STATES.COMPLETED) {
            const r = transition(s, COMMANDS.RESET);
            if (r.valid) {
                store.setRoverState(r.newState);
                store.addStateHistory(s, r.newState, COMMANDS.RESET);
                addLog('INFO', 'Auto-reset to IDLE', 'SYSTEM');
            }
        }
    }, 3000);

    return { success: true, state: result.newState, mission: completedMission };
}

function requestRedelivery() {
    const currentState = store.getRoverState();
    // Only valid if rover is IDLE or RETURNING_HOME and there was a recent mission
    if (currentState !== STATES.IDLE) {
        return { success: false, error: 'Redelivery only available when rover is idle' };
    }

    const history = mission.getMissionHistory(1);
    if (history.length === 0) {
        return { success: false, error: 'No previous mission to redeliver' };
    }

    const lastMission = history[0];
    addLog('COMMAND', `Redelivery requested → Room ${lastMission.room}`, 'MISSION');

    return startMission(lastMission.room);
}

// ── Manual Override ─────────────────────────────────

function manualOverride(direction, speed = 100) {
    const currentState = store.getRoverState();
    const cmd = currentState === STATES.MANUAL_CONTROL ? COMMANDS.MANUAL_MOVE : COMMANDS.MANUAL_OVERRIDE;
    const result = transition(currentState, cmd);

    if (!result.valid) return { success: false, error: result.error };

    if (currentState !== STATES.MANUAL_CONTROL) {
        // Entering manual mode — cancel any timers
        clearInterval(navigationTimer);
        clearTimeout(waitingTimer);
        store.addStateHistory(currentState, result.newState, COMMANDS.MANUAL_OVERRIDE);
        addLog('WARN', `Manual override activated from ${currentState}`, 'MANUAL');
    }

    store.setRoverState(result.newState);
    setMotors(direction, speed);

    addLog('COMMAND', `Manual: ${direction} @ ${speed}`, 'MANUAL');

    return { success: true, state: result.newState, motors: getMotors() };
}

function stopManual() {
    const currentState = store.getRoverState();
    const result = transition(currentState, COMMANDS.STOP);
    if (!result.valid) return { success: false, error: result.error };

    store.setRoverState(result.newState);
    store.addStateHistory(currentState, result.newState, COMMANDS.STOP);
    stopAll();

    // Cancel active mission if one exists
    if (mission.getActiveMission()) {
        mission.cancelMission();
        addLog('WARN', 'Active mission cancelled due to manual stop', 'MISSION');
    }

    addLog('INFO', 'Manual control stopped — rover IDLE', 'MANUAL');
    addLog('INFO', `State: ${currentState} → ${result.newState}`, 'STATE_MACHINE');

    return { success: true, state: result.newState };
}

// ── Status & Reset ──────────────────────────────────

function getStatus() {
    return {
        state: store.getRoverState(),
        motors: getMotors(),
        payload: payload.getStatus(),
        mission: mission.getActiveMission(),
        validCommands: getValidCommands(store.getRoverState()),
        timestamp: new Date().toISOString(),
    };
}

function resetRover() {
    clearInterval(navigationTimer);
    clearTimeout(waitingTimer);
    store.resetStore();
    resetMotors();
    payload.reset();
    if (mission.getActiveMission()) mission.cancelMission();
    addLog('INFO', 'Rover reset to IDLE', 'SYSTEM');
    return getStatus();
}

module.exports = {
    startMission, openCompartment, closeCompartment, requestRedelivery,
    manualOverride, stopManual,
    getStatus, resetRover,
};

