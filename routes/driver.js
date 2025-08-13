const express = require("express");
const Driver = require("../models/Driver");
const auth = require("../middleware/auth");
const router = express.Router();

// CREATE
router.post("/", auth, async (req, res) => {
  const driver = new Driver(req.body);
  await driver.save();
  res.json(driver);
});

// READ
router.get("/", auth, async (req, res) => {
  res.json(await Driver.find());
});

// UPDATE
router.put("/:id", auth, async (req, res) => {
  res.json(
    await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true })
  );
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  await Driver.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

module.exports = router;
