const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// 🔥 GET recommendations
router.get("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;

    const currentProduct = await Product.findById(productId);

    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🔥 1. SAME CATEGORY (PRIMARY)
    let recommendations = await Product.find({
      category: currentProduct.category,
      _id: { $ne: productId },
    }).limit(6);

    // 🔥 2. FALLBACK (avoid duplicates)
    if (recommendations.length < 6) {
      const existingIds = recommendations.map((p) => p._id);

      const more = await Product.find({
        _id: { $ne: productId, $nin: existingIds },
      }).limit(6 - recommendations.length);

      recommendations = [...recommendations, ...more];
    }

    res.status(200).json(recommendations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching recommendations" });
  }
});

module.exports = router;