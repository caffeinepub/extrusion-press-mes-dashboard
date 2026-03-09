// Banco Aluminium MES Middleware API
// Connects your MySQL database to the Caffeine MES Dashboard
//
// Setup:
//   npm install express mysql2 cors
//   node middleware-template.js
//
// Configuration: update DB_CONFIG below with your MySQL credentials

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DB_CONFIG = {
  host: 'localhost',
  user: 'your_mysql_user',
  password: 'your_mysql_password',
  database: 'your_mes_database',
};

// GET /api/press-data
// Returns live press metrics for all presses
// The dashboard polls this endpoint every 30 seconds
app.get('/api/press-data', async (req, res) => {
  const conn = await mysql.createConnection(DB_CONFIG);
  try {
    // CUSTOMIZE: Update this SQL query to match your table/column names
    const [rows] = await conn.execute(`
      SELECT
        press_id          AS id,
        press_status      AS status,
        kg_per_hour       AS kgPerHour,
        oee_pct           AS oee,
        recovery_pct      AS recovery,
        input_mt          AS inputMt,
        output_mt         AS outputMt,
        contact_time_sec  AS contactTime,
        die_kg_h          AS dieKgH,
        pp_plan_billets   AS ppPlanBillets,
        pp_act_billets    AS ppActBillets,
        die_load_count    AS dieLoadCount,
        die_unload_count  AS dieUnloadCount,
        downtime_minutes  AS downtimeMinutes
      FROM press_live_metrics
      WHERE timestamp >= NOW() - INTERVAL 1 HOUR
      ORDER BY timestamp DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await conn.end();
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MES Middleware API running on http://localhost:${PORT}`);
  console.log(`Press data endpoint: http://localhost:${PORT}/api/press-data`);
});
