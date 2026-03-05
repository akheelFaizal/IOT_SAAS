const deviceTracker = require('./deviceTracker');

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
   * Aggregates total units (kWh) consumed
   * Note: In a real system, daily/monthly splits would require 
   * storing historical logs by day/month. For this simulation,
   * we'll treat the total accumulated as "monthly" and a fraction 
   * of it as "daily" (or just return total as both for demo purposes,
   * but let's simulate a standard realistic output).
   */
  calculateTotalConsumption() {
    const devices = deviceTracker.getDevicesSnapshot();
    let totalKwh = 0;
    
    devices.forEach(device => {
      totalKwh += this.calculateDeviceEnergy(device);
    });

    // For simulation scaling (so user doesn't wait hours to see 1 unit):
    // Let's apply a "time multiplier" so 1 real minute = 1 simulated day.
    // For now, we will just return the raw calculated total.
    // NOTE: In the demo, since we want to hit 200 units quickly, 
    // we multiply by a high simulation factor.
    const SIMULATION_MULTIPLIER = 10000; // Speeds up time effectively
    
    const simulatedTotalUnits = totalKwh * SIMULATION_MULTIPLIER;

    return {
      total_units: simulatedTotalUnits,
      // Mocking daily as a fraction of total for API schema matching
      daily_units: simulatedTotalUnits > 0 ? simulatedTotalUnits / 30 : 0, 
      monthly_units: simulatedTotalUnits
    };
  }

  getActiveDevices() {
      const devices = deviceTracker.getDevicesSnapshot();
      return devices.filter(d => d.state).map(d => d.device_id);
  }
}

module.exports = new EnergyCalculator();
