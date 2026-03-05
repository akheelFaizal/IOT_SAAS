class TariffCalculator {
  /**
   * Kerala Slab Pricing:
   * 0–50 units -> ₹3
   * 51–100 units -> ₹5
   * 101–200 units -> ₹7
   * 200+ units -> ₹10
   */
  calculateEstimatedBill(totalUnits) {
    let bill = 0;
    let unitsLeft = totalUnits;

    // Slab 1: 0-50
    if (unitsLeft > 0) {
      const slabUnits = Math.min(unitsLeft, 50);
      bill += slabUnits * 3;
      unitsLeft -= slabUnits;
    }

    // Slab 2: 51-100
    if (unitsLeft > 0) {
      const slabUnits = Math.min(unitsLeft, 50);
      bill += slabUnits * 5;
      unitsLeft -= slabUnits;
    }

    // Slab 3: 101-200
    if (unitsLeft > 0) {
      const slabUnits = Math.min(unitsLeft, 100);
      bill += slabUnits * 7;
      unitsLeft -= slabUnits;
    }

    // Slab 4: > 200
    if (unitsLeft > 0) {
      bill += unitsLeft * 10;
    }

    return bill;
  }

  /**
   * Check if consumption is near the next slab boundary and return an alert message
   */
  generateAlerts(totalUnits, activeDevices) {
    const alerts = [];
    
    // Check boundaries (e.g. within 10 units of the next slab)
    if (totalUnits > 40 && totalUnits <= 50) {
      alerts.push("Warning: Approaching the 50 unit slab (₹3 -> ₹5). Consider reducing usage.");
    } else if (totalUnits > 90 && totalUnits <= 100) {
      alerts.push("Warning: Approaching the 100 unit slab (₹5 -> ₹7).");
    } else if (totalUnits > 190 && totalUnits <= 200) {
        let advice = "";
        if (activeDevices.includes("ac_bedroom")) {
            advice = "Consider turning off the Bedroom AC to save power.";
        } else {
            advice = "Consider reducing heavy appliance usage.";
        }
      alerts.push(`Critical: Approaching the 200 unit slab (highest tariff ₹10). ${advice}`);
    } else if (totalUnits > 200) {
      alerts.push("Alert: You are now in the highest tariff slab (200+ units, ₹10/unit).");
    }

    return alerts;
  }
}

module.exports = new TariffCalculator();
