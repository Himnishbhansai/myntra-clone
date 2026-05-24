const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Recent = require("../models/Recent");
const Wishlist = require("../models/Wishlist");
const Bag = require("../models/Bag");

// 🔥 RECOMMENDATION ENGINE (YOUR LOGIC)
router.get("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.query.userId; // optional but needed

    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const category = currentProduct.category;

    let finalMap = new Map();

    if (userId) {
      // 🔥 WISHLIST
      const wishlist = await Wishlist.find({ userId }).populate("productId");
      const W = wishlist.map((w) => w.productId).filter(Boolean);

      // 🔥 BAG
      const bag = await Bag.find({ userId }).populate("productId");
      const B = bag.map((b) => b.productId).filter(Boolean);

      // 🔥 UNION (W ∪ B)
      const WB_map = new Map();
      [...W, ...B].forEach((p) => {
        if (p) WB_map.set(p._id.toString(), p);
      });
      const WB = Array.from(WB_map.values());

      // 🔥 INTERSECTION with CATEGORY → (W ∪ B) ∩ C
      WB.forEach((p) => {
        if (
          p.category === category &&
          p._id.toString() !== productId
        ) {
          finalMap.set(p._id.toString(), p);
        }
      });

      // 🔥 RECENTLY VIEWED (A)
      const recent = await Recent.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("productId");

      recent.forEach((r) => {
        const p = r.productId;
        if (p && p._id.toString() !== productId) {
          finalMap.set(p._id.toString(), p);
        }
      });
    }

    let recommendations = Array.from(finalMap.values());

    // 🔥 FALLBACK (if empty / low)
    if (recommendations.length < 6) {
      const existingIds = recommendations.map((p) => p._id);

      const fallback = await Product.find({
        _id: { $ne: productId, $nin: existingIds },
        category,
      }).limit(6 - recommendations.length);

      recommendations = [...recommendations, ...fallback];
    }

    res.status(200).json(recommendations.slice(0, 6));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching recommendations" });
  }
});

module.exports = router;