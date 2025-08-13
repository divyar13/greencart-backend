const express = require("express");
const Driver = require("../models/Driver");
const Order = require("../models/Order");
const Route = require("../models/Route");
const auth = require("../middleware/auth");
const router = express.Router();

function isoToMinutesFromMidnightUTC(iso) {
  if (!iso) return 0;
  const d = new Date(iso);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

router.post("/", auth, async (req, res) => {
  try {
    const { driversAvailable, startTime, maxHoursPerDay } = req.body;
    if (!driversAvailable || !startTime || !maxHoursPerDay) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const allOrders = await Order.find().populate("assignedRoute");

    let onTime = 0,
      late = 0,
      totalProfit = 0,
      fuelCost = 0;

    allOrders.forEach((order) => {
      const route = order.assignedRoute;
      if (!route || typeof route.baseTime !== "number") {
        // Missing route — can't calculate
        late++;
        return;
      }

      // Extract delivery time as minutes
      let deliveryTimeMin = isoToMinutesFromMidnightUTC(
        order.deliveryTimestamp
      );
      console.log(deliveryTimeMin);

      // Add fuel cost based on traffic
      if (route.trafficLevel === "High") {
        fuelCost += route.distanceKm * (5 + 2);
      } else {
        fuelCost += route.distanceKm * 5;
      }

      // Compare vs baseTime
      if (deliveryTimeMin > route.baseTime) {
        late++;
        totalProfit -= 50; // penalty
      } else {
        onTime++;
        if (order.valueRs > 1000) {
          totalProfit += order.valueRs * 0.1; // bonus
        }
      }

      // Base order profit and fuel cost deduction
      totalProfit += order.valueRs;
      totalProfit -= route.distanceKm * 5;
    });

    const efficiency = onTime + late > 0 ? (onTime / (onTime + late)) * 100 : 0;

    res.json({
      totalProfit,
      efficiency,
      onTimeDeliveries: onTime,
      lateDeliveries: late,
      fuelCost,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Simulation failed", error: err.message });
  }
});

module.exports = router;
