const express = require("express");
const Bag = require("../models/Bag");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const Bags = new Bag(req.body);
    const saveitem = await Bags.save();
    res.status(200).json(saveitem);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/:userid", async (req, res) => {
  try {
    const bag = await Bag.find({ userId: req.params.userid }).populate(
      "productId"
    );
    res.status(200).json(bag);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.delete("/:itemid", async (req, res) => {
  try {
    await Bag.findByIdAndDelete(req.params.itemid);
    res.status(200).json({ message: "Item removed from bag" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error removing item from bag" });
  }
});

// 🔁 Move item (cart <-> save for later)
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

module.exports = router;
