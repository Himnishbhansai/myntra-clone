const express = require("express");
const Bag = require("../models/Bag");
const Product = require("../models/Product");
const router = express.Router();

// ✅ ADD TO BAG (NO DUPLICATES + HANDLE SAVED ITEMS)
router.post("/", async (req, res) => {
  try {
    const { userId, productId, size } = req.body;

    if (!userId || !productId || !size) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 🔥 FIND PRODUCT (for stock safety)
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    // 🔥 CHECK IF EXISTS (including saved items)
    const existingItem = await Bag.findOne({
      userId,
      productId,
      size,
    });

    if (existingItem) {
      // ✅ IF SAVED → MOVE BACK TO CART
      if (existingItem.savedForLater) {
        existingItem.savedForLater = false;
      }

      // 🔥 SAFE QUANTITY (DON’T EXCEED STOCK)
      if (product.stock !== undefined) {
        existingItem.quantity = Math.min(
          existingItem.quantity + 1,
          product.stock
        );
      } else {
        existingItem.quantity += 1;
      }

      await existingItem.save();
    } else {
      // ✅ CREATE NEW
      await Bag.create({
        userId,
        productId,
        size,
        quantity: 1,
      });
    }

    res.json({ message: "Bag updated" });
  } catch (err) {
    console.log("ADD BAG ERROR:", err);
    res.status(500).json({ message: "Error updating bag" });
  }
});

// ✅ GET BAG
router.get("/:userid", async (req, res) => {
  try {
    const bag = await Bag.find({
      userId: req.params.userid,
    }).populate("productId", "name brand price stock images");

    // 🔥 REMOVE INVALID PRODUCTS
    const validItems = bag.filter(
      (item) => item.productId !== null
    );

    res.status(200).json(validItems);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// ✅ DELETE ITEM
router.delete("/:itemid", async (req, res) => {
  try {
    await Bag.findByIdAndDelete(req.params.itemid);
    res.status(200).json({ message: "Item removed from bag" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error removing item" });
  }
});

// 🔁 MOVE ITEM (Cart <-> Save for Later)
router.put("/move/:id", async (req, res) => {
  try {
    const { savedForLater } = req.body;

    const updatedItem = await Bag.findByIdAndUpdate(
      req.params.id,
      { savedForLater },
      { new: true }
    );

    res.json(updatedItem);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error moving item" });
  }
});

// ✅ UPDATE QUANTITY (SMART + NO HARD ERRORS)
router.put("/quantity/:id", async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const item = await Bag.findById(req.params.id).populate(
      "productId",
      "name brand price stock images"
    );

    if (!item || !item.productId) {
      return res.status(400).json({ message: "Item not found" });
    }

    const stock = item.productId.stock;

    // 🔥 CLAMP INSTEAD OF ERROR
    let finalQty = quantity;

    if (stock !== undefined && quantity > stock) {
      finalQty = stock; // cap it
    }

    const updatedItem = await Bag.findByIdAndUpdate(
      req.params.id,
      { quantity: finalQty },
      { new: true }
    );

    res.json(updatedItem);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating quantity" });
  }
});

module.exports = router;