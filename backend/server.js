require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// 🔥 NEW
const cron = require("node-cron");
const Bag = require("./models/Bag");
const User = require("./models/User");
const { sendPushNotification } = require("../myntra/utils/notifications");

const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


// ================= ROUTES =================
app.use("/user", require("./routes/Userroutes"));
app.use("/product", require("./routes/Productroutes"));
app.use("/category", require("./routes/Categoryroutes"));
app.use("/wishlist", require("./routes/Wishlistroutes"));
app.use("/bag", require("./routes/Bagroutes"));
app.use("/order", require("./routes/OrderRoutes"));
app.use("/recent", require("./routes/Recentroutes"));
app.use("/recommend", require("./routes/Recommendationroutes"));
app.use("/transaction", require("./routes/TransactionRoutes"));


// ================= 🔥 CART ABANDONMENT JOB =================
// runs every 30 mins
cron.schedule("*/30 * * * *", async () => {
  console.log("⏳ Running cart abandonment job...");

  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // find users with old cart items
    const abandonedCarts = await Bag.find({
      updatedAt: { $lte: oneHourAgo },
      savedForLater: false,
    });

    const userMap = {};

    // group by user
    abandonedCarts.forEach((item) => {
      if (!userMap[item.userId]) {
        userMap[item.userId] = [];
      }
      userMap[item.userId].push(item);
    });

    // 🔥 send notifications
    for (let userId in userMap) {
      const user = await User.findById(userId);

      if (user?.expoPushToken) {
        await sendPushNotification(
          user.expoPushToken,
          "Items waiting in your cart 🛒",
          "Complete your purchase before they go out of stock!"
        );
      }
    }

    console.log("✅ Cart abandonment job done");
  } catch (error) {
    console.log("❌ Cart job error:", error);
  }
});


// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("Backend running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});