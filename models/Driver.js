const mongoose = require("mongoose");
const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  currentShiftHours: Number,
  past7DayHours: [Number],
});
module.exports = mongoose.model("Driver", driverSchema);
