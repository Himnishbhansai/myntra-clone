const express = require("express");
const Recent = require("../models/Recent");

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("Recent route working");
});

router.post("/", async (req, res) => {
  const { userId, productId } = req.body;

  try {
    await Recent.findOneAndDelete({ userId, productId });

    const newRecent = await Recent.create({ userId, productId });

    res.json(newRecent);
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const recents = await Recent.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("productId");

    res.json(recents.map(r => r.productId));
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

module.exports = router;