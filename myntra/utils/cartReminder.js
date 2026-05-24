const User = require("../models/User");
const Bag = require("../models/Bag");
const Order = require("../models/Order");
const { sendPushNotification } = require("./notifications");

const sendCartReminders = async () => {
  try {
    const users = await User.find({
      expoPushToken: { $exists: true },
    });

    for (let user of users) {
      // 🛒 check bag items
      const bagItems = await Bag.find({
        userId: user._id,
        savedForLater: false,
      });

      if (!bagItems.length) continue;

      // 📦 check recent orders (last 1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const recentOrder = await Order.findOne({
        userId: user._id,
        createdAt: { $gte: oneHourAgo },
      });

      // ❌ skip if user already ordered
      if (recentOrder) continue;

      // 🔥 SEND NOTIFICATION
      await sendPushNotification(
        user.expoPushToken,
        "Items waiting in your cart 🛒",
        "Complete your purchase before they go out of stock!"
      );
    }

    console.log("Cart reminders sent ✅");
  } catch (err) {
    console.log("Cart reminder error:", err);
  }
};

module.exports = { sendCartReminders };