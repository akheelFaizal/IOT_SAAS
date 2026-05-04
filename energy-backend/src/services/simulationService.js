const deviceTracker = require('./deviceTracker');

class SimulationService {
  constructor() {
    this.intervalId = null;
    this.devices = [
      'light_living_room',
      'tv_living_room',
      'fan_living_room',
      'light_bedroom',
      'ac_bedroom',
      'fan_bedroom',
      'light_kitchen',
      'fridge_kitchen'
    ];
  }

  start() {
    console.log('[Simulation] Starting IoT Real-time Simulation...');
    // Run every 15 seconds
    this.intervalId = setInterval(() => this.tick(), 15000);
    this.tick(); // Initial tick
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  tick() {
    const timestamp = Date.now();
    console.log(`[Simulation] Tick at ${new Date(timestamp).toLocaleTimeString()}`);

    // 0. Simulate global home metrics
    const hour = new Date(timestamp).getHours();
    const isDaylight = hour >= 6 && hour <= 18;
    const solarBase = isDaylight ? Math.max(0, Math.sin((hour - 6) * Math.PI / 12) * 500) : 0;
    
    const globalMetrics = {
      voltage: 230 + (Math.random() * 4 - 2), // 228V - 232V
      occupancy: hour >= 8 && hour <= 17 ? (Math.random() < 0.2 ? 1 : 0) : 1, // Mostly away during work hours
      solar_generation: solarBase * (0.8 + Math.random() * 0.4), // with jitter
      ev_charging: hour >= 22 || hour <= 4 ? (Math.random() < 0.3 ? 1 : 0) : 0, // Night charging
      anomaly: Math.random() < 0.01 ? 1 : 0
    };

    let totalActivePower = 0;
    let totalReactivePower = 0;
    let sub1 = 0; // Kitchen
    let sub2 = 0; // Laundry/Utility
    let sub3 = 0; // HVAC/Water Heater

    this.devices.forEach(deviceId => {
      const currentSnapshot = deviceTracker.getDevicesSnapshot().find(d => d.device_id === deviceId);
      
      if (currentSnapshot) {
        const basePower = currentSnapshot.power_rating_watts;
        const jitter = basePower * (0.95 + Math.random() * 0.1);
        const actualPower = currentSnapshot.state ? jitter : 0;
        
        totalActivePower += actualPower;

        // Simulate Reactive Power (Inductive loads like AC/Fans have higher reactive components)
        let pf = 0.95; // Power factor
        if (deviceId.includes('ac') || deviceId.includes('fan')) pf = 0.85;
        if (deviceId.includes('fridge')) pf = 0.9;
        
        const reactivePower = actualPower > 0 ? (actualPower * Math.sqrt(1/(pf*pf) - 1)) : 0;
        totalReactivePower += reactivePower;

        // Map to Sub-meters
        if (deviceId.includes('kitchen')) sub1 += actualPower;
        if (deviceId.includes('ac')) sub3 += actualPower;

        // 3. Log telemetry with global context
        deviceTracker.logTelemetry(deviceId, actualPower, currentSnapshot.state ? 'on' : 'off', {
          ...globalMetrics,
          global_intensity: totalActivePower / globalMetrics.voltage,
          global_reactive_power: totalReactivePower / 1000, // in kVAR
          sub1: sub1 / 10, // Normalized for UCI dataset scale
          sub2: sub2 / 10,
          sub3: sub3 / 10
        });
      }
    });
  }
}

module.exports = new SimulationService();
