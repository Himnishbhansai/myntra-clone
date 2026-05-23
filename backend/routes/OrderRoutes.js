const express = require("express");
const Bag = require("../models/Bag");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const Product = require("../models/Product"); // 🔥 ADD THIS

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

    // 🔥 CRITICAL VALIDATION LOOP
    for (let item of bag) {
      const product = await Product.findById(item.productId?._id);

      // ❌ DISCONTINUED PRODUCT
      if (!product) {
        return res.status(400).json({
          message: `Some products are no longer available`,
        });
      }

      // ❌ PRICE CHANGED
      if (product.price !== item.priceAtAdd) {
        return res.status(400).json({
          message: `Price changed for ${product.name}`,
        });
      }

      // ❌ STOCK CHECK
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Only ${product.stock} left for ${product.name}`,
        });
      }
    }

    // ✅ CREATE ORDER ITEMS (use locked price)
    const orderItems = bag.map((item) => ({
      productId: item.productId._id,
      size: item.size,
      price: item.priceAtAdd, // 🔥 USE LOCKED PRICE
      quantity: item.quantity,
    }));

    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const newOrder = await Order.create({
      userId: userid,
      date: new Date().toISOString(),
      status: "Processing",
      items: orderItems,
      total,
      shippingAddress,
      paymentMethod,
      tracking: genrateRandomTracking(),
    });

    // ✅ TRANSACTION
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

    // ✅ CLEAR CART
    await Bag.deleteMany({
      userId: userid,
      savedForLater: false,
    });

    res.status(200).json({
      message: "Order placed successfully",
      order: newOrder,
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