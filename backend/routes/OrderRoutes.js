const express = require("express");
const Bag = require("../models/Bag");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction"); // ✅ ADDED

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

  const randomcarrier =
    carriers[Math.floor(Math.random() * carriers.length)];
  const randomstatusOptions =
    statusOptions[Math.floor(Math.random() * statusOptions.length)];
  const randomlocations =
    locations[Math.floor(Math.random() * locations.length)];

  return {
    number: "TRK" + Math.floor(Math.random() * 10000000),
    carrier: randomcarrier,
    estimatedDelivery: new Date(
      Date.now() + 5 * 24 * 60 * 60 * 1000
    ).toISOString(),
    currentLocation: randomlocations,
    status: randomstatusOptions,
    timeline: [
      {
        status: "Order placed",
        location: "Warehouse",
        timestamp: new Date().toISOString(),
      },
      {
        status: randomstatusOptions,
        location: randomlocations,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

// ✅ CHECKOUT
router.post("/create/:userId", async (req, res) => {
  try {
    const userid = req.params.userId;

    const bag = await Bag.find({
      userId: userid,
      savedForLater: false,
    }).populate("productId");

    if (bag.length === 0) {
      return res.status(400).json({ message: "No item in the bag" });
    }

    // 🔥 VALIDATION
    for (let item of bag) {
      const product = item.productId;

      if (!product) {
        return res.status(400).json({
          message: "Some products are no longer available",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} is out of stock`,
        });
      }

      if (item.priceAtAdd && item.priceAtAdd !== product.price) {
        return res.status(400).json({
          message: `${product.name} price has changed`,
        });
      }
    }

    // ✅ ORDER ITEMS
    const orderItems = bag.map((item) => ({
      productId: item.productId._id,
      size: item.size,
      price: item.productId.price,
      quantity: item.quantity,
    }));

    // ✅ TOTAL
    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const newOrder = new Order({
      userId: userid,
      date: new Date().toISOString(),
      status: "Processing",
      items: orderItems,
      total: total,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      tracking: genrateRandomTracking(),
    });

    await newOrder.save();

    // ✅🔥 CREATE TRANSACTION (THIS WAS MISSING)
    await Transaction.create({
      userId: userid,
      amount: total,
      status: "success",
      paymentMethod: req.body.paymentMethod,
      invoiceId: "INV-" + Date.now(),
    });

    // 🧹 CLEAR CART
    await Bag.deleteMany({
      userId: userid,
      savedForLater: false,
    });

    res.status(200).json({
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// ✅ GET USER ORDERS
router.get("/user/:userid", async (req, res) => {
  try {
    const order = await Order.find({
      userId: req.params.userid,
    }).populate("items.productId");

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;