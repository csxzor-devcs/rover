// ─── Zephyra Log Service ───────────────────────────────────────────
// In-memory structured logging with level filtering.

const { v4: uuidv4 } = require('uuid');

const LEVELS = ['INFO', 'WARN', 'ERROR', 'COMMAND'];
const MAX_LOGS = 500;

let logs = [];

/**
 * Add a log entry.
 * @param {'INFO'|'WARN'|'ERROR'|'COMMAND'} level
 * @param {string} message
 * @param {string} [source='SYSTEM']
 */
function addLog(level, message, source = 'SYSTEM') {
    const entry = {
        id: uuidv4(),
        level,
        message,
        source,
        timestamp: new Date().toISOString(),
    };
    logs.unshift(entry); // newest first
    if (logs.length > MAX_LOGS) logs.pop();
    return entry;
}

/**
 * Get logs with optional filtering.
 * @param {{ level?: string, source?: string, limit?: number }} [filter]
 */
function getLogs(filter = {}) {
    let result = [...logs];
    if (filter.level) result = result.filter((l) => l.level === filter.level);
    if (filter.source) result = result.filter((l) => l.source === filter.source);
    if (filter.limit) result = result.slice(0, filter.limit);
    return result;
}

function clearLogs() {
    logs = [];
}

function getLogCount() {
    return logs.length;
}

module.exports = { addLog, getLogs, clearLogs, getLogCount, LEVELS };
