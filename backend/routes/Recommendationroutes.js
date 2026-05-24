const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Recent = require("../models/Recent"); // browsing history
const Wishlist = require("../models/Wishlist"); // if you have this

router.get("/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const category = currentProduct.category;

    // 🔥 WISHLIST
    const wishlist = await Wishlist.find({ userId }).populate("productId");
    const W = wishlist.map((w) => w.productId).filter(Boolean);

    // 🔥 BAG
    const bag = await Bag.find({ userId }).populate("productId");
    const B = bag.map((b) => b.productId).filter(Boolean);

    // 🔥 UNION (wishlist ∪ bag)
    const WB_map = new Map();
    [...W, ...B].forEach((p) => {
      if (p) WB_map.set(p._id.toString(), p);
    });
    const WB = Array.from(WB_map.values());

    // 🔥 INTERSECTION with CATEGORY
    const WB_ids = WB.map((p) => p._id);

    const WB_intersect_C = await Product.find({
      _id: { $in: WB_ids, $ne: productId },
      category,
    });

    // 🔥 RECENTLY VIEWED
    const recent = await Recent.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("productId");

    const A = recent.map((r) => r.productId).filter(Boolean);

    // 🔥 FINAL UNION
    const finalMap = new Map();

    [...WB_intersect_C, ...A].forEach((p) => {
      if (p && p._id.toString() !== productId) {
        finalMap.set(p._id.toString(), p);
      }
    });

    let recommendations = Array.from(finalMap.values());

    // 🔥 FALLBACK
    if (recommendations.length < 10) {
      const existingIds = recommendations.map((p) => p._id);

      const fallback = await Product.find({
        _id: { $ne: productId, $nin: existingIds },
      }).limit(10 - recommendations.length);

      recommendations = [...recommendations, ...fallback];
    }

    res.json(recommendations.slice(0, 10));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching recommendations" });
  }
});

module.exports = router;