// ─── FAB_05 v2 Server Entry Point ─────────────────────────────────
const express = require('express');
const cors = require('cors');
const roverRoutes = require('./routes/roverRoutes');
const missionRoutes = require('./routes/missionRoutes');
const logRoutes = require('./routes/logRoutes');
const { addLog } = require('./services/logService');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging (non-GET only)
app.use((req, res, next) => {
    if (req.method !== 'GET') {
        addLog('INFO', `${req.method} ${req.originalUrl}`, 'HTTP');
    }
    next();
});

// API Routes
app.use('/api/rover', roverRoutes);
app.use('/api/mission', missionRoutes);
app.use('/api/logs', logRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        service: 'FAB_05 Delivery Control System',
        status: 'online',
        version: '2.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

// 404
app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Error handler
app.use((err, req, res, next) => {
    addLog('ERROR', `Server error: ${err.message}`, 'HTTP');
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    addLog('INFO', `FAB_05 v2 server started on port ${PORT}`, 'SYSTEM');
    console.log(`\n  📦 FAB_05 Delivery Control System v2`);
    console.log(`  ───────────────────────────────────────`);
    console.log(`  Server running on http://localhost:${PORT}`);
    console.log(`  API:    http://localhost:${PORT}/api/rover/status`);
    console.log(`  Health: http://localhost:${PORT}/api/health\n`);
});

