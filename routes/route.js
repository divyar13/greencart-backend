const express = require("express");
const Route = require("../models/Route");
const auth = require("../middleware/auth");
const router = express.Router();

// CRUD endpoints (create, read, update, delete)
router.post("/", auth, async (req, res) => {
  const route = new Route(req.body);
  await route.save();
  res.json(route);
});

router.get("/", auth, async (req, res) => {
  res.json(await Route.find());
});

router.put("/:id", auth, async (req, res) => {
  res.json(
    await Route.findByIdAndUpdate(req.params.id, req.body, { new: true })
  );
});

router.delete("/:id", auth, async (req, res) => {
  await Route.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

module.exports = router;
