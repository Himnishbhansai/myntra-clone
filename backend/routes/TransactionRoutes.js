const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const { Parser } = require("json2csv");

// ✅ CREATE TRANSACTION (we’ll call this from order)
router.post("/", async (req, res) => {
  try {
    const { userId, amount, paymentMethod } = req.body;

    const transaction = await Transaction.create({
      userId,
      amount,
      paymentMethod,
      status: "success",
      invoiceId: "INV-" + Date.now(),
      logs: [
        {
          status: "success",
          message: "Transaction created",
        },
      ],
    });

    res.json(transaction);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating transaction" });
  }
});

// ✅ GET USER TRANSACTIONS (pagination + sorting)
router.get("/:userId", async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "desc" } = req.query;

    const transactions = await Transaction.find({
      userId: req.params.userId,
    })
      .sort({ createdAt: sort === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Transaction.countDocuments({
      userId: req.params.userId,
    });

    res.json({
      data: transactions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

const { Parser } = require("json2csv");

// ✅ EXPORT CSV
router.get("/export/:userId", async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });

    const fields = [
      "invoiceId",
      "amount",
      "status",
      "paymentMethod",
      "createdAt",
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(transactions);

    res.header("Content-Type", "text/csv");
    res.attachment("transactions.csv");
    return res.send(csv);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error exporting CSV" });
  }
});

module.exports = router;