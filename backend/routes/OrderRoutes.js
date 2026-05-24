const express = require("express");
const Bag = require("../models/Bag");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const Product = require("../models/Product");
const User = require("../models/User"); // ✅ NEW
const { sendPushNotification } = require("../notifications"); // ✅ NEW

const router = express.Router();

function genrateRandomTracking() {
  const carriers = ["Delhivery", "Bluedart", "Ecom Express", "XpressBees"];
  const statusOptions = [
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "In Transit",
  ];
  const locations = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune"];

  return {
    number: "TRK" + Math.floor(Math.random() * 10000000),
    carrier: carriers[Math.floor(Math.random() * carriers.length)],
    estimatedDelivery: new Date(
      Date.now() + 5 * 24 * 60 * 60 * 1000
    ).toISOString(),
    currentLocation: locations[Math.floor(Math.random() * locations.length)],
    status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
    timeline: [
      {
        status: "Order placed",
        location: "Warehouse",
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

router.post("/create/:userId", async (req, res) => {
  try {
    const userid = req.params.userId;
    const { shippingAddress, paymentMethod } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method missing" });
    }

    const bag = await Bag.find({
      userId: userid,
      savedForLater: false,
    }).populate("productId");

    if (!bag.length) {
      return res.status(400).json({ message: "No item in the bag" });
    }

    const validItems = [];
    const failedItems = [];

    for (let item of bag) {
      const product = item.productId;

      if (!product) {
        failedItems.push({
          name: "Unknown product",
          reason: "Removed",
        });
        continue;
      }

      if (product.stock < item.quantity) {
        failedItems.push({
          name: product.name,
          reason: "Out of stock",
        });
        continue;
      }

      validItems.push({
        productId: product._id,
        size: item.size,
        price: item.priceAtAdd || product.price,
        quantity: item.quantity,
      });
    }

    if (validItems.length === 0) {
      return res.status(400).json({
        message: "No valid items to order",
        failedItems,
      });
    }

    const total = validItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const newOrder = await Order.create({
      userId: userid,
      date: new Date().toISOString(),
      status: "Processing",
      items: validItems,
      total,
      shippingAddress,
      paymentMethod,
      tracking: genrateRandomTracking(),
    });

    await Transaction.create({
      userId: userid,
      amount: total,
      paymentMethod,
      paymentId: "PAY-" + Date.now(),
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

    const validProductIds = validItems.map((i) =>
      i.productId.toString()
    );

    await Bag.deleteMany({
      userId: userid,
      savedForLater: false,
      productId: { $in: validProductIds },
    });

    // 🔥 ✅ SEND PUSH NOTIFICATION
    const user = await User.findById(userid);

    if (user?.expoPushToken) {
      await sendPushNotification(
        user.expoPushToken,
        "Order Confirmed 🎉",
        "Your order has been placed successfully!"
      );
    }

    res.status(200).json({
      message: "Order placed successfully",
      order: newOrder,
      failedItems,
    });

  } catch (error) {
    console.log("ORDER ERROR:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// ✅ GET USER ORDERS
router.get("/user/:userid", async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.params.userid,
    }).populate("items.productId");

    res.status(200).json(orders);
  } catch (error) {
    console.log("FETCH ORDER ERROR:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;  