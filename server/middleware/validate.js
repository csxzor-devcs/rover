// ─── Command Validation Middleware (v2) ────────────────────────────

function validateMissionStart(req, res, next) {
    const { room } = req.body;
    if (!room) {
        return res.status(400).json({ error: 'Missing required field: room' });
    }
    if (typeof room !== 'string' && typeof room !== 'number') {
        return res.status(400).json({ error: 'Room must be a string or number' });
    }
    next();
}

function validateManualCommand(req, res, next) {
    const { direction, speed } = req.body;
    const VALID_DIRECTIONS = ['FORWARD', 'BACKWARD', 'LEFT', 'RIGHT'];

    if (!direction) {
        return res.status(400).json({ error: 'Missing required field: direction', validDirections: VALID_DIRECTIONS });
    }
    if (!VALID_DIRECTIONS.includes(direction)) {
        return res.status(400).json({ error: `Invalid direction: "${direction}"`, validDirections: VALID_DIRECTIONS });
    }
    if (speed !== undefined && (typeof speed !== 'number' || speed < 0 || speed > 255)) {
        return res.status(400).json({ error: 'Speed must be a number between 0 and 255' });
    }
    next();
}

module.exports = { validateMissionStart, validateManualCommand };
