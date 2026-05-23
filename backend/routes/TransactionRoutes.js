const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");


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

// 🔥 DOWNLOAD RECEIPT (PDF)
router.get("/receipt/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt-${transaction.invoiceId}.pdf`
    );

    doc.pipe(res);

    // 🎨 CONTENT
    doc.fontSize(20).text("Payment Receipt", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Invoice ID: ${transaction.invoiceId}`);
    doc.text(`Amount: ₹${transaction.amount}`);
    doc.text(`Status: ${transaction.status}`);
    doc.text(`Payment Method: ${transaction.paymentMethod}`);
    doc.text(
      `Date: ${new Date(transaction.createdAt).toLocaleString()}`
    );

    doc.moveDown();
    doc.text("Thank you for your purchase ❤️");

    doc.end();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error generating receipt" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { userId, amount, paymentMethod, paymentId } = req.body;

    // 🔥 check if already exists
    const existing = await Transaction.findOne({ paymentId });

    if (existing) {
      return res.json(existing); // ✅ prevent duplicate
    }

    const invoiceId = "INV-" + Date.now();

    const newTransaction = await Transaction.create({
      userId,
      amount,
      paymentMethod,
      paymentId,
      status: "success",
      invoiceId,
      logs: [
        {
          status: "success",
          message: "Transaction created",
          timestamp: new Date(),
        },
      ],
    });

    res.json(newTransaction);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating transaction" });
  }
});

module.exports = router;