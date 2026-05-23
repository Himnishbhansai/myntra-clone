const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");


// ✅ CREATE TRANSACTION (IDEMPOTENT)
router.post("/", async (req, res) => {
  try {
    const { userId, amount, paymentMethod, paymentId } = req.body;

    // 🔥 BASIC VALIDATION (prevents 500)
    if (!userId || !amount || !paymentMethod) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 🔥 ensure paymentId always exists
    const finalPaymentId = paymentId || "PAY-" + Date.now();

    // 🔥 prevent duplicates
    const existing = await Transaction.findOne({ paymentId: finalPaymentId });
    if (existing) return res.json(existing);

    const newTransaction = await Transaction.create({
      userId,
      amount,
      paymentMethod,
      paymentId: finalPaymentId,
      status: "success",
      invoiceId: "INV-" + Date.now(),
      logs: [
        {
          status: "created",
          message: "Transaction initiated",
          timestamp: new Date(),
        },
        {
          status: "success",
          message: "Payment successful",
          timestamp: new Date(),
        },
      ],
    });

    res.json(newTransaction);
  } catch (err) {
    console.log("CREATE TXN ERROR:", err);
    res.status(500).json({ message: "Error creating transaction" });
  }
});


// ✅ GET USER TRANSACTIONS (SAFE PAGINATION)
router.get("/:userId", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort === "asc" ? 1 : -1;

    const transactions = await Transaction.find({
      userId: req.params.userId,
    })
      .sort({ createdAt: sort })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Transaction.countDocuments({
      userId: req.params.userId,
    });

    res.json({
      data: transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.log("FETCH TXN ERROR:", err);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});


// ✅ EXPORT CSV (SAFE)
router.get("/export/:userId", async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });

    if (!transactions.length) {
      return res.status(404).json({ message: "No transactions found" });
    }

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
    console.log("CSV ERROR:", err);
    res.status(500).json({ message: "Error exporting CSV" });
  }
});


// ✅ PDF RECEIPT
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
    console.log("PDF ERROR:", err);
    res.status(500).json({ message: "Error generating receipt" });
  }
});

module.exports = router;