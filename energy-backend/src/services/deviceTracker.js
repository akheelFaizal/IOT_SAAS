const db = require('../db/postgres');

// Maintains the state and total runtime of each device
class DeviceTracker {
  constructor() {
    // Map of device_id -> { device_name, power_rating_watts, state, last_turned_on_time, total_uptime_ms }
    this.devices = new Map();
  }

  /**
   * Register or update a device's known static info
   */
  registerDevice(deviceId, deviceName, powerRatingWatts) {
    if (!this.devices.has(deviceId)) {
      this.devices.set(deviceId, {
        device_name: deviceName,
        power_rating_watts: powerRatingWatts,
        state: false,
        last_turned_on_time: null,
        total_uptime_ms: 0,
      });
    }
  }

  /**
   * Handle an incoming state change event
   * @param {string} deviceId 
   * @param {string} state - 'on' or 'off'
   * @param {number} timestamp - Unix timestamp in ms
   */
  updateDeviceState(deviceId, state, timestamp) {
    const isOn = state === 'on';
    
    // Auto-register if not seen before (ideally, pre-register them, 
    // but in a dynamic system we can guess basic info or require pre-registration)
    if (!this.devices.has(deviceId)) {
        // Fallbacks for unknown devices in a generic scenario
        let defaultPower = 100; // 100W fallback
        if (deviceId.includes('ac')) defaultPower = 1500;
        if (deviceId.includes('fridge')) defaultPower = 200;
        if (deviceId.includes('fan')) defaultPower = 75;
        if (deviceId.includes('tv')) defaultPower = 150;
        if (deviceId.includes('light')) defaultPower = 40;

        this.registerDevice(deviceId, deviceId, defaultPower);
    }

    const device = this.devices.get(deviceId);

    // Only process if the state is actually changing
    if (device.state !== isOn) {
      if (isOn) {
        // Turning ON
        device.state = true;
        device.last_turned_on_time = timestamp;
      } else {
        // Turning OFF
        device.state = false;
        if (device.last_turned_on_time !== null) {
          const uptime = timestamp - device.last_turned_on_time;
          device.total_uptime_ms += (uptime > 0 ? uptime : 0);
          
          if (uptime > 0) {
            this.saveSessionToDb(deviceId, device.power_rating_watts, device.last_turned_on_time, timestamp, uptime);
          }
          
          device.last_turned_on_time = null;
        }
      }
    }
  }

  async saveSessionToDb(deviceId, powerRatingWatts, turnedOnTimeMs, turnedOffTimeMs, durationMs) {
    const durationSeconds = Math.round(durationMs / 1000);
    const durationHours = durationMs / (1000 * 60 * 60);
    const energyKwh = (powerRatingWatts * durationHours) / 1000;

    const query = `
      INSERT INTO device_usage_sessions 
      (device_id, power_rating_watts, turned_on_at, turned_off_at, duration_seconds, energy_kwh)
      VALUES ($1, $2, to_timestamp($3), to_timestamp($4), $5, $6)
    `;
    const values = [
      deviceId, 
      powerRatingWatts, 
      turnedOnTimeMs / 1000.0, 
      turnedOffTimeMs / 1000.0, 
      durationSeconds, 
      energyKwh
    ];

    try {
      await db.query(query, values);
      console.log(`[DB Insert] Saved session for ${deviceId}: ${energyKwh.toFixed(4)} kWh`);
    } catch (err) {
      console.error(`[DB Error] Failed to save session for ${deviceId}:`, err);
    }
  }

  async logTelemetry(deviceId, powerConsumptionWatts, status, metrics = {}) {
    const { 
      voltage = 230, 
      global_intensity = 0, 
      occupancy = 0, 
      solar_generation = 0, 
      ev_charging = 0, 
      anomaly = 0,
      global_reactive_power = 0.1,
      sub1 = 0,
      sub2 = 0,
      sub3 = 0
    } = metrics;

    const query = `
      INSERT INTO telemetry (
        device_id, power_consumption, status, 
        voltage, global_intensity, occupancy, 
        solar_generation, ev_charging, anomaly,
        global_reactive_power, sub1, sub2, sub3
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `;
    const values = [
      deviceId, powerConsumptionWatts, status,
      voltage, global_intensity, occupancy,
      solar_generation, ev_charging, anomaly,
      global_reactive_power, sub1, sub2, sub3
    ];

    try {
      await db.query(query, values);
    } catch (err) {
      console.error(`[DB Error] Failed to log telemetry for ${deviceId}:`, err);
    }
  }

  /**
   * Returns a snapshot of all devices, including dynamically calculating
   * the uptime for devices that are currently ON up to 'now'.
   */
  getDevicesSnapshot() {
    const now = Date.now();
    const snapshot = [];

    for (const [id, data] of this.devices.entries()) {
      let currentUptimeMs = data.total_uptime_ms;
      
      // If currently running, add the time since it was turned on
      if (data.state && data.last_turned_on_time !== null) {
        const activeTime = now - data.last_turned_on_time;
        currentUptimeMs += (activeTime > 0 ? activeTime : 0);
      }

      const uptimeHours = currentUptimeMs / (1000 * 60 * 60);

      snapshot.push({
        device_id: id,
        device_name: data.device_name,
        power_rating_watts: data.power_rating_watts,
        state: data.state,
        usage_time_hours: uptimeHours
      });
    }

    return snapshot;
  }
}

module.exports = new DeviceTracker();
