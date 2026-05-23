const express = require("express");
const Bag = require("../models/Bag");
const Product = require("../models/Product"); // 🔥 ADD THIS
const router = express.Router();

// ✅ ADD TO BAG (ATOMIC + PRICE LOCK)
router.post("/", async (req, res) => {
  try {
    const { userId, productId, size, quantity } = req.body;

    // 🔥 GET PRODUCT (for price + stock check)
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    if (product.stock < (quantity || 1)) {
      return res.status(400).json({ message: "Out of stock" });
    }

    // 🔥 ATOMIC UPDATE (prevents duplicates + race condition)
    const updatedItem = await Bag.findOneAndUpdate(
      {
        userId,
        productId,
        size,
        savedForLater: false,
      },
      {
        $inc: { quantity: quantity || 1 },
      },
      {
        new: true,
      }
    );

    if (updatedItem) {
      return res.status(200).json(updatedItem);
    }

    // ✅ CREATE NEW ITEM WITH PRICE LOCK
    const newItem = await Bag.create({
      userId,
      productId,
      size,
      quantity: quantity || 1,
      savedForLater: false,
      priceAtAdd: product.price, // 🔥 CRITICAL (price snapshot)
    });

    res.status(200).json(newItem);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
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

// ✅ UPDATE QUANTITY (WITH STOCK VALIDATION)
router.put("/quantity/:id", async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const item = await Bag.findById(req.params.id).populate("productId", "name brand price stock images");

    if (!item || !item.productId) {
      return res.status(400).json({ message: "Item not found" });
    }

    // 🔥 STOCK CHECK
    if (item.productId.stock < quantity) {
      return res.status(400).json({
        message: "Not enough stock available",
      });
    }

    const updatedItem = await Bag.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true }
    );

    res.json(updatedItem);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating quantity" });
  }
});

module.exports = router;