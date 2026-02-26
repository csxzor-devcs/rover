// ─── Mission API Routes ────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { validateMissionStart } = require('../middleware/validate');
const sim = require('../rover/simulator');
const mission = require('../services/missionService');

// POST /api/mission/start — Start a new delivery mission
router.post('/start', validateMissionStart, (req, res) => {
    const result = sim.startMission(req.body.room);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
});

// POST /api/mission/open — User opens compartment
router.post('/open', (req, res) => {
    const result = sim.openCompartment();
    if (!result.success) return res.status(400).json(result);
    res.json(result);
});

// POST /api/mission/close — User closes compartment
router.post('/close', (req, res) => {
    const result = sim.closeCompartment();
    if (!result.success) return res.status(400).json(result);
    res.json(result);
});

// POST /api/mission/redelivery — Request redelivery
router.post('/redelivery', (req, res) => {
    const result = sim.requestRedelivery();
    if (!result.success) return res.status(400).json(result);
    res.json(result);
});

// GET /api/mission/active — Get active mission
router.get('/active', (req, res) => {
    const active = mission.getActiveMission();
    res.json({ mission: active });
});

// GET /api/mission/history — Get past missions
router.get('/history', (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    res.json({ missions: mission.getMissionHistory(limit) });
});

module.exports = router;
