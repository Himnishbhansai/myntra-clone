const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// 🔥 SMART RECOMMENDATION ENGINE
router.get("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;

    const currentProduct = await Product.findById(productId);

    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { category, price, name } = currentProduct;

    // 🔥 extract keywords (item type)
    const keywords = name.split(" ");

    // 🔥 1. SIMILAR TYPE (name match)
    let recommendations = await Product.find({
      _id: { $ne: productId },
      name: { $regex: keywords[0], $options: "i" }, // loose match
    }).limit(6);

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

    // 🔥 4. FINAL FALLBACK (anything)
    if (recommendations.length < 6) {
      const existingIds = recommendations.map((p) => p._id);

      const fallback = await Product.find({
        _id: { $ne: productId, $nin: existingIds },
      }).limit(6 - recommendations.length);

      recommendations = [...recommendations, ...fallback];
    }

    res.status(200).json(recommendations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching recommendations" });
  }
});

module.exports = router;