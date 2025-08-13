const mongoose = require("mongoose");
const routeSchema = new mongoose.Schema({
  routeId: { type: String, required: true },
  distanceKm: Number,
  trafficLevel: String, // should validate in frontend/backend
  baseTime: Number,
});
module.exports = mongoose.model("Route", routeSchema);
