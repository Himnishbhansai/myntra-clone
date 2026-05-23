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
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // ✅ UPSERT instead of delete + create (prevents duplicates completely)
    await Recent.findOneAndUpdate(
      { userId, productId },
      {
        userId,
        productId,
        createdAt: new Date(),
      },
      {
        upsert: true, // create if not exists
        new: true,
      }
    );

    // 🔥 KEEP ONLY LATEST 20
    const recents = await Recent.find({ userId })
      .sort({ createdAt: -1 });

    if (recents.length > 20) {
      const idsToDelete = recents.slice(20).map((r) => r._id);

      await Recent.deleteMany({ _id: { $in: idsToDelete } });
    }

    res.json({ message: "Recent updated" });

  } catch (err) {
    console.log("ADD RECENT ERROR:", err);
    res.status(500).json({ message: "Error adding recent" });
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