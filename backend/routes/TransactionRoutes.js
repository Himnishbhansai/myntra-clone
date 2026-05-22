const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

// GET USER TRANSACTIONS
router.get("/:userId", async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });

    res.json({ data: transactions });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

module.exports = router;