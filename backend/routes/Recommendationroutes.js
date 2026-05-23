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

    // 🔥 A = RECENTLY VIEWED
    const recent = await Recent.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("productId");

    const A = recent
      .map((r) => r.productId)
      .filter(Boolean);

    // 🔥 B = WISHLIST
    const wishlist = await Wishlist.find({ userId }).populate("productId");

    const B = wishlist
      .map((w) => w.productId)
      .filter(Boolean);

    // 🔥 C = SAME CATEGORY PRODUCTS
    const C = await Product.find({
      category,
      _id: { $ne: productId },
    });

    // 🔥 A ∩ C
    const A_ids = new Set(A.map((p) => p._id.toString()));
    const A_intersect_C = C.filter((p) =>
      A_ids.has(p._id.toString())
    );

    // 🔥 B ∪ (A ∩ C)
    const map = new Map();

    [...B, ...A_intersect_C].forEach((p) => {
      if (p && p._id.toString() !== productId) {
        map.set(p._id.toString(), p);
      }
    });

    let recommendations = Array.from(map.values());

    // 🔥 LIMIT + FALLBACK
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