const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const deviceTracker = require('./services/deviceTracker');
const energyCalculator = require('./services/energyCalculator');
const tariffCalculator = require('./services/tariffCalculator');
const simulationService = require('./services/simulationService');
const { pool, initDB } = require('./db/postgres');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token is invalid or expired' });
        req.user = user;
        next();
    });
};

// --- Auth Routes ---

// Signup
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );

        const token = jwt.sign({ id: newUser.rows[0].id, email: newUser.rows[0].email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({ token, user: newUser.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.rows[0].id, email: user.rows[0].email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({
            token,
            user: {
                id: user.rows[0].id,
                name: user.rows[0].name,
                email: user.rows[0].email
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// --- IoT Protected Routes ---

app.post('/device-event', (req, res) => {
  const { device, state, timestamp } = req.body;
  if (!device || !state || !timestamp) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  deviceTracker.updateDeviceState(device, state, timestamp);
  res.status(200).json({ success: true });
});

app.get('/energy-summary', authenticateToken, async (req, res) => {
  try {
    const consumptionStats = await energyCalculator.getConsumptionAggregates();
    const totalUnits = consumptionStats.monthly_units;
    const activeDevices = energyCalculator.getActiveDevices();
    const estimatedBill = tariffCalculator.calculateEstimatedBill(totalUnits);
    const alerts = tariffCalculator.generateAlerts(totalUnits, activeDevices);

    let aiInsights = null;
    try {
       const mlInput = await energyCalculator.getMLInput();
       if (mlInput) {
          const mlBaseUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
          const mlPrediction = await axios.post(`${mlBaseUrl}/predict-consumption`, mlInput);
          const mlRecommendations = await axios.post(`${mlBaseUrl}/optimize-usage`, mlPrediction.data);
          
          aiInsights = {
             ...mlPrediction.data,
             recommendations: mlRecommendations.data.recommendations
          };
       }
    } catch (error) {
       console.error('ML Service Error:', error.message);
    }

    const budgetRes = await pool.query("SELECT value FROM settings WHERE key = 'target_budget'");
    const targetBudget = budgetRes.rows.length > 0 ? parseFloat(budgetRes.rows[0].value) : 2500;

    res.json({
      daily_units: parseFloat(consumptionStats.daily_units.toFixed(2)),
      monthly_units: parseFloat(consumptionStats.monthly_units.toFixed(2)),
      estimated_bill: parseFloat(estimatedBill.toFixed(2)),
      target_budget: targetBudget,
      active_devices: activeDevices,
      alerts: alerts,
      ai_insights: aiInsights
    });
  } catch (err) {
    res.status(500).send('Database Error');
  }
});

app.get('/historical-trends', authenticateToken, async (req, res) => {
    let dbData = await energyCalculator.getHistoricalTrends();
    res.json(dbData);
});

// Get all devices
app.get('/api/devices', authenticateToken, (req, res) => {
    const devices = deviceTracker.getDevicesSnapshot();
    res.json(devices);
});

// Get recent telemetry
// --- LIVE TELEMETRY FOR REAL-TIME GRAPH ---
app.get('/api/live-telemetry', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                DATE_TRUNC('minute', timestamp) as time,
                SUM(power_consumption) as total_power
            FROM telemetry
            WHERE timestamp >= (NOW() AT TIME ZONE 'UTC') - INTERVAL '30 minutes'
            GROUP BY DATE_TRUNC('minute', timestamp)
            ORDER BY time ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database Error');
    }
});

// --- PEAK USAGE ANALYSIS ---
app.get('/api/peak-analysis', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                EXTRACT(HOUR FROM timestamp) || ':00' as hour,
                AVG(power_consumption) as avg_load
            FROM telemetry
            WHERE timestamp >= (NOW() AT TIME ZONE 'UTC') - INTERVAL '7 days'
            GROUP BY EXTRACT(HOUR FROM timestamp)
            ORDER BY EXTRACT(HOUR FROM timestamp) ASC
        `;
        const result = await pool.query(query);
        // Normalize for the percentage-based graph
        const maxLoad = Math.max(...result.rows.map(r => parseFloat(r.avg_load))) || 1;
        const normalized = result.rows.map(r => ({
            hour: r.hour,
            load: Math.round((parseFloat(r.avg_load) / maxLoad) * 100)
        }));
        res.json(normalized);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database Error');
    }
});

app.get('/api/telemetry', authenticateToken, async (req, res) => {
    const { device_id, limit = 100 } = req.query;
    try {
        let query = 'SELECT * FROM telemetry';
        let values = [];
        
        if (device_id) {
            query += ' WHERE device_id = $1';
            values.push(device_id);
        }
        
        query += ' ORDER BY timestamp DESC LIMIT $' + (values.length + 1);
        values.push(limit);
        
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching telemetry' });
    }
});

app.get('/api/settings', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT key, value FROM settings');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.key] = row.value;
        });
        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching settings' });
    }
});

app.post('/api/settings', authenticateToken, async (req, res) => {
    const { key, value } = req.body;
    if (!key || value === undefined) {
        return res.status(400).json({ message: 'Key and value are required' });
    }
    try {
        await pool.query(
            'INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP',
            [key, value.toString()]
        );
        res.json({ success: true, message: `Setting ${key} updated` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating setting' });
    }
});

app.listen(PORT, async () => {
  await initDB();
  simulationService.start();
  console.log(`Server listening on http://localhost:${PORT}`);
});
