const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Recent = require("../models/Recent");
const Wishlist = require("../models/Wishlist");
const Bag = require("../models/Bag");

router.get("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.query.userId;

    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const category = currentProduct.category;

    const finalMap = new Map(); // 🔥 single source of truth

    if (userId) {
      // 🔥 WISHLIST
      const wishlist = await Wishlist.find({ userId }).populate("productId");

      // 🔥 BAG
      const bag = await Bag.find({ userId }).populate("productId");

      // 🔥 (Wishlist ∪ Bag)
      [...wishlist, ...bag].forEach((item) => {
        const p = item.productId;
        if (
          p &&
          p.category === category &&
          p._id.toString() !== productId &&
          !finalMap.has(p._id.toString()) // 🔥 NO DUP
        ) {
          finalMap.set(p._id.toString(), p);
        }
      });

      // 🔥 Recently Viewed
      const recent = await Recent.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("productId");

      recent.forEach((r) => {
        const p = r.productId;
        if (
          p &&
          p._id.toString() !== productId &&
          !finalMap.has(p._id.toString()) // 🔥 NO DUP
        ) {
          finalMap.set(p._id.toString(), p);
        }
      });
    }

    let recommendations = Array.from(finalMap.values());

    // 🔥 FALLBACK (also dedup-safe)
    if (recommendations.length < 6) {
      const existingIds = recommendations.map((p) => p._id);

      const fallback = await Product.find({
        _id: { $ne: productId, $nin: existingIds },
        category,
      }).limit(6 - recommendations.length);

      fallback.forEach((p) => {
        if (!finalMap.has(p._id.toString())) {
          finalMap.set(p._id.toString(), p);
        }
      });

      recommendations = Array.from(finalMap.values());
    }

    res.status(200).json(recommendations.slice(0, 6));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching recommendations" });
  }
});

module.exports = router;