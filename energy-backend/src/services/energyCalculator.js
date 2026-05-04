const deviceTracker = require('./deviceTracker');
const db = require('../db/postgres');

class EnergyCalculator {

  /**
   * Calculate energy consumption for a specific device.
   * Energy (kWh) = Power (Watts) × Time (Hours) / 1000
   */
  calculateDeviceEnergy(device) {
    const { power_rating_watts, usage_time_hours } = device;
    const kwh = (power_rating_watts * usage_time_hours) / 1000;
    return kwh;
  }

  /**
   * Fetch aggregated consumption from Postgres + add any active (live) usage 
   * since the last time the DB was updated (when devices were turned ON but not yet OFF).
   */
  async getConsumptionAggregates() {
    // 1. Get historical daily/monthly totals from DB
    let dailyDbKwh = 0;
    let monthlyDbKwh = 0;
    
    try {
        const query = `
          SELECT 
            SUM(CASE WHEN DATE(turned_on_at) = CURRENT_DATE THEN energy_kwh ELSE 0 END) as daily_kwh,
            SUM(CASE WHEN DATE_TRUNC('month', turned_on_at) = DATE_TRUNC('month', CURRENT_DATE) THEN energy_kwh ELSE 0 END) as monthly_kwh
          FROM device_usage_sessions
        `;
        const res = await db.query(query);
        if (res.rows.length > 0) {
            dailyDbKwh = parseFloat(res.rows[0].daily_kwh) || 0;
            monthlyDbKwh = parseFloat(res.rows[0].monthly_kwh) || 0;
        }
    } catch (err) {
        console.error('[DB Error] Failed to aggregate consumption:', err);
    }

    // 2. Add in-memory active tracking 
    // (for devices currently ON, whose sessions haven't been inserted to DB yet)
    let liveKwh = 0;
    const devicesSnapshot = deviceTracker.getDevicesSnapshot();
    
    devicesSnapshot.forEach(device => {
      // Only care about the *active* session portion that isn't in DB yet. 
      // getDevicesSnapshot() returns total_usage_time_hours since server boot. 
      // To be strictly correct across restarts, we should look at active time 
      // Since we just want live feedback to update, calculating energy since last_turned_on_time is better.
      const internalDevice = deviceTracker.devices.get(device.device_id);
      if (internalDevice && internalDevice.state && internalDevice.last_turned_on_time) {
          const uptimeMs = Date.now() - internalDevice.last_turned_on_time;
          const uptimeHours = (uptimeMs > 0 ? uptimeMs : 0) / (1000 * 60 * 60);
          liveKwh += (internalDevice.power_rating_watts * uptimeHours) / 1000;
      }
    });

    const totalDaily = dailyDbKwh + liveKwh;
    const totalMonthly = monthlyDbKwh + liveKwh;

    return {
      daily_units: totalDaily,
      monthly_units: totalMonthly
    };
  }

  getActiveDevices() {
      const devices = deviceTracker.getDevicesSnapshot();
      return devices.filter(d => d.state).map(d => d.device_id);
  }

  /**
   * Fetch daily aggregated usage per device for the last 30 days
   */
  async getHistoricalTrends() {
      try {
          const query = `
            SELECT 
                DATE(turned_on_at) as date,
                device_id,
                SUM(duration_seconds) as total_duration_seconds,
                SUM(energy_kwh) as total_energy_kwh
            FROM device_usage_sessions
            WHERE turned_on_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE(turned_on_at), device_id
            ORDER BY DATE(turned_on_at) ASC;
          `;
          const res = await db.query(query);
          return res.rows;
      } catch (err) {
          console.error('[DB Error] Failed to fetch historical trends:', err);
          return [];
      }
  }
  /**
   * Aggregates latest telemetry into the format expected by the ML Service
   */
  async getMLInput() {
      try {
          // 1. Get latest global metrics (from the most recent telemetry entry)
          const latestQuery = `
            SELECT * FROM telemetry 
            ORDER BY timestamp DESC LIMIT 1
          `;
          const latestRes = await db.query(latestQuery);
          if (latestRes.rows.length === 0) return null;
          
          const latest = latestRes.rows[0];

          // 2. Get history (last 60 minute-level aggregates)
          const historyQuery = `
            SELECT 
                DATE_TRUNC('minute', timestamp) as min,
                SUM(power_consumption) as total_power
            FROM telemetry
            WHERE timestamp >= NOW() - INTERVAL '60 minutes'
            GROUP BY DATE_TRUNC('minute', timestamp)
            ORDER BY min ASC
          `;
          const historyRes = await db.query(historyQuery);
          const history = historyRes.rows.map(r => parseFloat(r.total_power) / 1000); // convert W to kW

          return {
              Global_reactive_power: parseFloat(latest.global_reactive_power) || 0.1, 
              Voltage: parseFloat(latest.voltage) || 230.0,
              Global_intensity: parseFloat(latest.global_intensity) || 0.0,
              Sub_metering_1: parseFloat(latest.sub1) || 0, 
              Sub_metering_2: parseFloat(latest.sub2) || 0,
              Sub_metering_3: parseFloat(latest.sub3) || 0,
              Occupancy: parseInt(latest.occupancy) || 0,
              Solar_Generation: (parseFloat(latest.solar_generation) || 0) / 1000,
              EV_Charging: parseInt(latest.ev_charging) || 0,
              Anomaly: parseInt(latest.anomaly) || 0,
              Hour: new Date().getHours(),
              history: history.length > 0 ? history : [0]
          };
      } catch (err) {
          console.error('[ML Data Prep Error]', err);
          return null;
      }
  }
}

module.exports = new EnergyCalculator();
