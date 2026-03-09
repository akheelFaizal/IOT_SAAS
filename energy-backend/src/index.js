const express = require('express');
const cors = require('cors');
const axios = require('axios');

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

  // Call ML Service for AI predictions
  let mlPredictions = null;
  try {
     const devicesSnapshot = deviceTracker.getDevicesSnapshot();
     // Map device snapshots to ML input format
     const mlDevices = devicesSnapshot.map(d => {
        let type = 'Lighting';
        if (d.device_id.includes('ac')) type = 'AC';
        if (d.device_id.includes('fridge')) type = 'Refrigerator';
        if (d.device_id.includes('fan')) type = 'Fan';
        if (d.device_id.includes('tv')) type = 'TV';
        
        return {
          device: type,
          hours: d.usage_time_hours || 0,
          power: d.power_rating_watts || 100,
          room: 'living_room'
        };
     });
     
     if (mlDevices.length > 0) {
        const mlResponse = await axios.post('http://localhost:8000/predict-consumption', {
           devices: mlDevices,
           temperature: 28.0,
           day_of_week: "weekday",
           time_of_day: "evening"
        });
        mlPredictions = mlResponse.data;
     }
  } catch (error) {
     console.error('Failed to get ML predictions:', error.message);
  }

  // Example structured response
  const responsePayload = {
    daily_units: parseFloat(consumptionStats.daily_units.toFixed(2)),
    monthly_units: parseFloat(consumptionStats.monthly_units.toFixed(2)),
    estimated_bill: parseFloat(estimatedBill.toFixed(2)),
    active_devices: activeDevices,
    alerts: alerts,
    ai_insights: mlPredictions
  };

  res.status(200).json(responsePayload);
});

// Endpoint to fetch 30-day historical device trends
app.get('/historical-trends', async (req, res) => {
    const defaultData = [
       // Some static fallback data if DB fails or lacks data
       { date: new Date().toISOString().split('T')[0], device_id: 'ac', total_energy_kwh: 5.2 },
       { date: new Date().toISOString().split('T')[0], device_id: 'fridge', total_energy_kwh: 1.5 },
       { date: new Date().toISOString().split('T')[0], device_id: 'tv', total_energy_kwh: 0.8 },
       { date: new Date().toISOString().split('T')[0], device_id: 'fan', total_energy_kwh: 0.4 },
    ];
    
    let dbData = await energyCalculator.getHistoricalTrends();
    
    // Fallback if no db data exists (useful during testing without active db sessions)
    if (dbData.length === 0) {
        dbData = defaultData;
    }

    res.status(200).json(dbData);
});

// Optional: Provide endpoint to view the internal device states
app.get('/devices', (req, res) => {
   res.status(200).json(deviceTracker.getDevicesSnapshot());
});

app.listen(PORT, async () => {
  await db.initDB();
  console.log(`Energy Backend Engine listening on http://localhost:${PORT}`);
});
