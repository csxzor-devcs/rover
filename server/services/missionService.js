// ─── FAB_05 Mission Service ──────────────────────────────────────
// In-memory mission lifecycle manager for delivery operations.

const { v4: uuidv4 } = require('uuid');

const MISSION_STATUS = {
    NAVIGATING: 'NAVIGATING',
    ARRIVED: 'ARRIVED',
    WAITING: 'WAITING',
    DELIVERED: 'DELIVERED',
    RETURNED: 'RETURNED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};

let activeMission = null;
let missionHistory = [];
const MAX_HISTORY = 50;

function createMission(room) {
    if (activeMission) {
        throw new Error('A mission is already active');
    }
    activeMission = {
        missionId: uuidv4(),
        room: String(room),
        status: MISSION_STATUS.NAVIGATING,
        progress: 0,
        startTime: new Date().toISOString(),
        arrivalTime: null,
        waitStartTime: null,
        openedTime: null,
        closedTime: null,
        returnTime: null,
        completedTime: null,
        timeoutSeconds: 120,
    };
    return { ...activeMission };
}

function updateMissionStatus(status, extra = {}) {
    if (!activeMission) return null;

    activeMission.status = status;
    const now = new Date().toISOString();

    switch (status) {
        case MISSION_STATUS.ARRIVED:
            activeMission.arrivalTime = now;
            activeMission.progress = 100;
            break;
        case MISSION_STATUS.WAITING:
            activeMission.waitStartTime = now;
            break;
        case MISSION_STATUS.DELIVERED:
            activeMission.openedTime = now;
            break;
        case MISSION_STATUS.RETURNED:
            activeMission.returnTime = now;
            break;
        case MISSION_STATUS.COMPLETED:
            activeMission.completedTime = now;
            break;
        case MISSION_STATUS.CANCELLED:
            activeMission.completedTime = now;
            break;
    }

    Object.assign(activeMission, extra);
    return { ...activeMission };
}

function updateProgress(progress) {
    if (!activeMission) return;
    activeMission.progress = Math.min(100, Math.max(0, progress));
}

function getActiveMission() {
    return activeMission ? { ...activeMission } : null;
}

function completeMission() {
    if (!activeMission) return null;
    activeMission.completedTime = new Date().toISOString();
    const completed = { ...activeMission };
    missionHistory.unshift(completed);
    if (missionHistory.length > MAX_HISTORY) missionHistory.pop();
    activeMission = null;
    return completed;
}

function cancelMission() {
    if (!activeMission) return null;
    activeMission.status = MISSION_STATUS.CANCELLED;
    activeMission.completedTime = new Date().toISOString();
    const cancelled = { ...activeMission };
    missionHistory.unshift(cancelled);
    if (missionHistory.length > MAX_HISTORY) missionHistory.pop();
    activeMission = null;
    return cancelled;
}

function getMissionHistory(limit = 20) {
    return missionHistory.slice(0, limit);
}

function resetMissions() {
    activeMission = null;
    missionHistory = [];
}

module.exports = {
    MISSION_STATUS,
    createMission, updateMissionStatus, updateProgress,
    getActiveMission, completeMission, cancelMission,
    getMissionHistory, resetMissions,
};

