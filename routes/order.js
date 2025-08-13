const express = require("express");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const router = express.Router();

// CREATE a new order
router.post("/", auth, async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.json(order);
});

// READ all orders
router.get("/", auth, async (req, res) => {
  res.json(await Order.find().populate("assignedRoute"));
});

// UPDATE an order by ID
router.put("/:id", auth, async (req, res) => {
  res.json(
    await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
  );
});

// DELETE an order by ID
router.delete("/:id", auth, async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

module.exports = router;
