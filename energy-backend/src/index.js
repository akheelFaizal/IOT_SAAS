const express = require('express');
const cors = require('cors');

const deviceTracker = require('./services/deviceTracker');
const energyCalculator = require('./services/energyCalculator');
const tariffCalculator = require('./services/tariffCalculator');
const db = require('./db/postgres');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Endpoint to receive state toggle events from the 3D application
app.post('/device-event', (req, res) => {
  const { device, state, timestamp } = req.body;

  if (!device || !state || !timestamp) {
    return res.status(400).json({ error: 'Missing required fields: device, state, timestamp' });
  }

  deviceTracker.updateDeviceState(device, state, timestamp);
  
  // Log event
  console.log(`[Event Received] Device: ${device} -> State: ${state}`);

  res.status(200).json({ success: true, message: `Updated state for ${device}` });
});

// Endpoint to retrieve energy stats and estimated bill
app.get('/energy-summary', async (req, res) => {
  const consumptionStats = await energyCalculator.getConsumptionAggregates();
  const totalUnits = consumptionStats.monthly_units;
  
  const activeDevices = energyCalculator.getActiveDevices();
  const estimatedBill = tariffCalculator.calculateEstimatedBill(totalUnits);
  const alerts = tariffCalculator.generateAlerts(totalUnits, activeDevices);

  // Example structured response
  const responsePayload = {
    daily_units: parseFloat(consumptionStats.daily_units.toFixed(2)),
    monthly_units: parseFloat(consumptionStats.monthly_units.toFixed(2)),
    estimated_bill: parseFloat(estimatedBill.toFixed(2)),
    active_devices: activeDevices,
    alerts: alerts,
  };

  res.status(200).json(responsePayload);
});

// Optional: Provide endpoint to view the internal device states
app.get('/devices', (req, res) => {
   res.status(200).json(deviceTracker.getDevicesSnapshot());
});

app.listen(PORT, async () => {
  await db.initDB();
  console.log(`Energy Backend Engine listening on http://localhost:${PORT}`);
});
