// ─── FAB_05 v2 API Client ─────────────────────────────────────────

const BASE = '/api';

async function request(url, options = {}) {
    const res = await fetch(`${BASE}${url}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    const data = await res.json();
    if (!res.ok) throw { status: res.status, ...data };
    return data;
}

// ── Mission ──────────────────────────────────

export function startMission(room) {
    return request('/mission/start', {
        method: 'POST',
        body: JSON.stringify({ room }),
    });
}

export function openCompartment() {
    return request('/mission/open', { method: 'POST' });
}

export function closeCompartment() {
    return request('/mission/close', { method: 'POST' });
}

export function requestRedelivery() {
    return request('/mission/redelivery', { method: 'POST' });
}

export function getActiveMission() {
    return request('/mission/active');
}

export function getMissionHistory(limit = 20) {
    return request(`/mission/history?limit=${limit}`);
}

// ── Rover ────────────────────────────────────

export function getRoverStatus() {
    return request('/rover/status');
}

export function sendManual(direction, speed = 100) {
    return request('/rover/manual', {
        method: 'POST',
        body: JSON.stringify({ direction, speed }),
    });
}

export function stopManual() {
    return request('/rover/stop', { method: 'POST' });
}

export function resetRover() {
    return request('/rover/reset', { method: 'POST' });
}

export function getStateHistory(limit = 50) {
    return request(`/rover/history?limit=${limit}`);
}

// ── Logs ─────────────────────────────────────

export function getLogs(filter = {}) {
    const params = new URLSearchParams();
    if (filter.level) params.set('level', filter.level);
    if (filter.limit) params.set('limit', filter.limit);
    const qs = params.toString();
    return request(`/logs${qs ? `?${qs}` : ''}`);
}

export function clearLogs() {
    return request('/logs', { method: 'DELETE' });
}

