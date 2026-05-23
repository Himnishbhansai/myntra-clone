const express = require("express");
const Recent = require("../models/Recent");

const router = express.Router();

// ✅ TEST ROUTE
router.get("/test", (req, res) => {
  res.send("Recent route working");
});

// ✅ ADD / MERGE RECENTS (SINGLE + BULK SUPPORT)
router.post("/", async (req, res) => {
  try {
    const { userId, productId, products } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    let itemsToProcess = [];

    // ================================
    // 🔥 CASE 1: BULK MERGE (LOGIN)
    // ================================
    if (products && Array.isArray(products)) {
      // ✅ remove duplicates in incoming data
      const uniqueMap = new Map();

      for (let item of products) {
        if (!item.productId) continue;

        uniqueMap.set(item.productId.toString(), {
          productId: item.productId,
          createdAt: item.viewedAt || new Date(),
        });
      }

      itemsToProcess = Array.from(uniqueMap.values());
    }

    // ================================
    // 🔥 CASE 2: SINGLE ADD
    // ================================
    else if (productId) {
      itemsToProcess = [
        {
          productId,
          createdAt: new Date(),
        },
      ];
    }

    else {
      return res.status(400).json({
        message: "Provide productId or products array",
      });
    }

    // ================================
    // 🔥 UPSERT (NO DUPLICATES EVER)
    // ================================
    for (let item of itemsToProcess) {
      await Recent.findOneAndUpdate(
        { userId, productId: item.productId },
        {
          userId,
          productId: item.productId,
          createdAt: item.createdAt,
        },
        { upsert: true, new: true }
      );
    }

    // ================================
    // 🔥 KEEP ONLY LATEST 20
    // ================================
    const allRecents = await Recent.find({ userId })
      .sort({ createdAt: -1 });

    if (allRecents.length > 20) {
      const idsToDelete = allRecents.slice(20).map(i => i._id);

      await Recent.deleteMany({
        _id: { $in: idsToDelete },
      });
    }

    res.json({ message: "Recent updated" });

  } catch (err) {
    console.log("RECENT ERROR:", err);
    res.status(500).json({ message: "Error updating recents" });
  }
});

// ✅ GET RECENTS
router.get("/:userId", async (req, res) => {
  try {
    const recents = await Recent.find({
      userId: req.params.userId,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("productId");

    res.json(recents);

  } catch (err) {
    console.log("GET RECENT ERROR:", err);
    res.status(500).json({ message: "Error fetching recents" });
  }
});

module.exports = router;