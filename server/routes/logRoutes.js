// ─── Log API Routes ────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { getLogs, clearLogs, getLogCount } = require('../services/logService');

// GET /api/logs — Get logs with optional filters
router.get('/', (req, res) => {
    const { level, source, limit } = req.query;
    const filter = {};
    if (level) filter.level = level.toUpperCase();
    if (source) filter.source = source.toUpperCase();
    if (limit) filter.limit = parseInt(limit);

    res.json({
        logs: getLogs(filter),
        total: getLogCount(),
    });
});

// DELETE /api/logs — Clear all logs
router.delete('/', (req, res) => {
    clearLogs();
    res.json({ message: 'Logs cleared' });
});

module.exports = router;
