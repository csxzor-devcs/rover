// ─── Rover API Routes (v2) ─────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { validateManualCommand } = require('../middleware/validate');
const sim = require('../rover/simulator');
const store = require('../services/store');

// GET /api/rover/status — Full rover status
router.get('/status', (req, res) => {
    res.json(sim.getStatus());
});

// POST /api/rover/manual — Manual override movement
router.post('/manual', validateManualCommand, (req, res) => {
    const { direction, speed } = req.body;
    const result = sim.manualOverride(direction, speed || 100);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
});

// POST /api/rover/stop — Stop manual control
router.post('/stop', (req, res) => {
    const result = sim.stopManual();
    if (!result.success) return res.status(400).json(result);
    res.json(result);
});

// POST /api/rover/reset — Full reset
router.post('/reset', (req, res) => {
    const status = sim.resetRover();
    res.json({ message: 'Rover reset to IDLE', ...status });
});

// GET /api/rover/history — State history
router.get('/history', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    res.json({ history: store.getStateHistory(limit) });
});

module.exports = router;
