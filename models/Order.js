const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  valueRs: Number,
  assignedRoute: { type: mongoose.Schema.Types.ObjectId, ref: "Route" },
  deliveryTimestamp: Date,
});
module.exports = mongoose.model("Order", orderSchema);
