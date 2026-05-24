const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Recent = require("../models/Recent");
const Wishlist = require("../models/Wishlist");
const Bag = require("../models/Bag");

// 🔥 SMART RECOMMENDATION ENGINE
router.get("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;

    const currentProduct = await Product.findById(productId);

    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { category, price, name } = currentProduct;

    // 🔥 extract keywords (better than single word)
    const keywords = name.split(" ").filter((k) => k.length > 2);

    // 🔥 USER CONTEXT (lightweight, no structure change)
    let wishlistIds = [];
    let bagIds = [];
    let recentIds = [];

    if (req.query.userId) {
      const userId = req.query.userId;

      const wishlist = await Wishlist.find({ userId });
      wishlistIds = wishlist.map((w) => w.productId.toString());

      const bag = await Bag.find({ userId });
      bagIds = bag.map((b) => b.productId.toString());

      const recent = await Recent.find({ userId }).limit(50);
      recentIds = recent.map((r) => r.productId.toString());
    }

    const priorityIds = new Set([
      ...wishlistIds,
      ...bagIds,
      ...recentIds,
    ]);

    // 🔥 1. SIMILAR TYPE (multi-keyword match)
    let recommendations = await Product.find({
      _id: { $ne: productId },
      $or: keywords.map((k) => ({
        name: { $regex: k, $options: "i" },
      })),
    }).limit(10);

    // 🔥 BOOST: move priority items to top
    recommendations.sort((a, b) => {
      const aScore = priorityIds.has(a._id.toString()) ? 1 : 0;
      const bScore = priorityIds.has(b._id.toString()) ? 1 : 0;
      return bScore - aScore;
    });

    // 🔥 2. SIMILAR PRICE RANGE (±300)
    if (recommendations.length < 6) {
      const existingIds = recommendations.map((p) => p._id);

      const priceBased = await Product.find({
        _id: { $ne: productId, $nin: existingIds },
        price: { $gte: price - 300, $lte: price + 300 },
      }).limit(6 - recommendations.length);

      recommendations = [...recommendations, ...priceBased];
    }

    // 🔥 3. SAME CATEGORY (fallback)
    if (recommendations.length < 6) {
      const existingIds = recommendations.map((p) => p._id);

      const categoryBased = await Product.find({
        _id: { $ne: productId, $nin: existingIds },
        category,
      }).limit(6 - recommendations.length);

      recommendations = [...recommendations, ...categoryBased];
    }

    // 🔥 4. FINAL FALLBACK
    if (recommendations.length < 6) {
      const existingIds = recommendations.map((p) => p._id);

      const fallback = await Product.find({
        _id: { $ne: productId, $nin: existingIds },
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