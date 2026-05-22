const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      required: true,
    },

    invoiceId: {
      type: String,
      unique: true,
      required: true,
    },

    // 🔥 audit log
    logs: [
      {
        status: String,
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);