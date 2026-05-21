const express = require("express");
const Recent = require("../models/Recent");

const router = express.Router();

// ✅ test route
router.get("/test", (req, res) => {
  res.send("Recent route working");
});

// ✅ ADD / UPDATE recent (no duplicates)
router.post("/", async (req, res) => {
  const { userId, productId } = req.body;

  try {
    // remove duplicate if exists
    await Recent.findOneAndDelete({ userId, productId });

    // create new (latest)
    const newRecent = await Recent.create({ userId, productId });

    res.json(newRecent);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error adding recent" });
  }
});

// ✅ GET recents (FIXED)
router.get("/:userId", async (req, res) => {
  try {
    const recents = await Recent.find({ userId: req.params.userId })
      .sort({ createdAt: -1 }) // latest first
      .limit(20) // ✅ max 20 (requirement)
      .populate("productId"); // ✅ VERY IMPORTANT

    res.json(recents); // ✅ FIX: DO NOT map()
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching recents" });
  }
});

module.exports = router;