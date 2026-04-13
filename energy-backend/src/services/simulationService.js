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

    this.devices.forEach(deviceId => {
      const device = deviceTracker.devices.get(deviceId);
      
      // 1. Simulate random state changes (10% chance to toggle, except fridge which stays on)
      if (deviceId !== 'fridge_kitchen' && Math.random() < 0.1) {
        const newState = device ? !device.state : Math.random() < 0.5;
        deviceTracker.updateDeviceState(deviceId, newState ? 'on' : 'off', timestamp);
      }

      // 2. Refresh device snapshot to get latest info
      const currentSnapshot = deviceTracker.getDevicesSnapshot().find(d => d.device_id === deviceId);
      
      if (currentSnapshot) {
        // 3. Log telemetry
        // Add some jitter to consumption power rating (+/- 5%)
        const basePower = currentSnapshot.power_rating_watts;
        const jitter = basePower * (0.95 + Math.random() * 0.1);
        const actualPower = currentSnapshot.state ? jitter : 0;
        
        deviceTracker.logTelemetry(deviceId, actualPower, currentSnapshot.state ? 'on' : 'off');
      }
    });
  }
}

module.exports = new SimulationService();
