const express = require("express");
const Recent = require("../models/Recent");

const router = express.Router();

// ✅ TEST ROUTE
router.get("/test", (req, res) => {
  res.send("Recent route working");
});

// ✅ ADD / UPDATE RECENT (IDEMPOTENT + LIMIT 20)
router.post("/", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 🔥 REMOVE DUPLICATE (if exists)
    await Recent.findOneAndDelete({ userId, productId });

    // ✅ CREATE NEW (latest)
    await Recent.create({
      userId,
      productId,
      createdAt: new Date(),
    });

    // 🔥 ENFORCE MAX 20 (IMPORTANT FOR TASK)
    const allRecents = await Recent.find({ userId })
      .sort({ createdAt: -1 });

    if (allRecents.length > 20) {
      const extra = allRecents.slice(20); // beyond 20
      const idsToDelete = extra.map((item) => item._id);

      await Recent.deleteMany({ _id: { $in: idsToDelete } });
    }

    res.json({ message: "Recent updated" });

  } catch (err) {
    console.log("ADD RECENT ERROR:", err);
    res.status(500).json({ message: "Error adding recent" });
  }
});

// ✅ GET RECENTS (SORTED + POPULATED)
router.get("/:userId", async (req, res) => {
  try {
    const recents = await Recent.find({
      userId: req.params.userId,
    })
      .sort({ createdAt: -1 }) // latest first
      .limit(20) // ✅ strict limit
      .populate("productId");

    res.json(recents);

  } catch (err) {
    console.log("GET RECENT ERROR:", err);
    res.status(500).json({ message: "Error fetching recents" });
  }
});

module.exports = router;