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
    
    // We will dynamically update these based on device state
    const globalMetrics = {
      voltage: 230 + (Math.random() * 4 - 2), // 228V - 232V
      occupancy: hour >= 8 && hour <= 17 ? (Math.random() < 0.2 ? 1 : 0) : 1, // Mostly away during work hours
      solar_generation: 0, 
      ev_charging: 0, 
      anomaly: Math.random() < 0.01 ? 1 : 0
    };

    let totalActivePower = 0;
    let totalReactivePower = 0;
    let sub1 = 0; // Kitchen
    let sub2 = 0; // Laundry/Utility
    let sub3 = 0; // HVAC/Water Heater

    const snapshots = deviceTracker.getDevicesSnapshot();

    this.devices.forEach(deviceId => {
      const currentSnapshot = snapshots.find(d => d.device_id === deviceId);
      
      if (currentSnapshot) {
        const basePower = currentSnapshot.power_rating_watts;
        const jitter = basePower * (0.95 + Math.random() * 0.1);
        const actualPower = currentSnapshot.state ? jitter : 0;

        // Route special devices into global metrics
        if (deviceId === 'solar_inverter_roof') {
            globalMetrics.solar_generation = currentSnapshot.state ? (solarBase * (0.8 + Math.random() * 0.4)) : 0;
            // Solar is generation, not consumption
            return; 
        }
        
        if (deviceId === 'ev_charger_garage') {
            globalMetrics.ev_charging = currentSnapshot.state ? 1 : 0;
        }

        totalActivePower += actualPower;
        
        if (deviceId.includes('ac') || deviceId.includes('fridge') || deviceId.includes('fan') || deviceId.includes('washer')) {
          totalReactivePower += actualPower * (0.2 + Math.random() * 0.1);
        }

        // Assign to Sub-metering Channels
        if (deviceId.includes('kitchen')) {
          sub1 += actualPower;
        } else if (deviceId.includes('washer')) {
          sub2 += actualPower;
        } else if (deviceId.includes('ac')) {
          sub3 += actualPower;
        } else if (deviceId === 'ev_charger_garage') {
          // Map EV to high-impact sub-meters so the ML model recognizes it
          sub3 += actualPower * 0.7; 
          sub2 += actualPower * 0.3;
        }
      }
    });

    // 3. Log ONE global telemetry entry for the whole home
    deviceTracker.logTelemetry('HOME', totalActivePower, 'active', {
      ...globalMetrics,
      global_intensity: totalActivePower / globalMetrics.voltage,
      global_reactive_power: totalReactivePower / 1000,
      sub1: sub1 / 10,
      sub2: sub2 / 10,
      sub3: sub3 / 10
    });
  }
}

module.exports = new SimulationService();
