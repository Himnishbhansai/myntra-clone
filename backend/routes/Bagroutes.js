const express = require("express");
const Bag = require("../models/Bag");
const router = express.Router();


// ✅ ADD TO BAG (NO DUPLICATES + INCREMENT QTY)
router.post("/", async (req, res) => {
  try {
    const { userId, productId, size, quantity } = req.body;

    // check if item already exists
    const existingItem = await Bag.findOne({
      userId,
      productId,
      size,
      savedForLater: false,
    });

    if (existingItem) {
      // increment quantity instead of creating new
      existingItem.quantity += quantity || 1;
      await existingItem.save();
      return res.status(200).json(existingItem);
    }

    const newItem = new Bag({
      userId,
      productId,
      size,
      quantity: quantity || 1,
      savedForLater: false,
    });

    const savedItem = await newItem.save();
    res.status(200).json(savedItem);

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
    }).populate("productId");

    res.status(200).json(bag);
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


// ✅ UPDATE QUANTITY (Concurrency-safe base)
router.put("/quantity/:id", async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
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