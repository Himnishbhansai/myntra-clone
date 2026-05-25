require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron"); // ✅ ADD

const Bag = require("./models/Bag"); // ✅ ADD
const User = require("./models/User"); // ✅ ADD
const { sendPushNotification } = require("./notifications"); // ✅ ADD

const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ================= CRON JOB =================
cron.schedule("*/10 * * * *", async () => {
  console.log("Running cart abandonment check...");

  try {
    const THIRTY_MIN = 30 * 60 * 1000;
    const now = Date.now();

    const bags = await Bag.find({ savedForLater: false });

    const usersMap = {};

    for (let item of bags) {
      const lastUpdated = new Date(item.updatedAt).getTime();

      // ✅ ONLY if inactive > 30 mins
      if (now - lastUpdated > THIRTY_MIN) {
        usersMap[item.userId] = true;
      }
    }

    for (let userId in usersMap) {
      const user = await User.findById(userId);

      if (user?.expoPushToken) {
        await sendPushNotification(
          user.expoPushToken,
          "You forgot something 🛒",
          "Items are still in your cart!",
        user._id
        );
      }
    }
  } catch (err) {
    console.log("CRON ERROR:", err);
  }
});
// ============================================

// ROUTES
app.use("/user", require("./routes/Userroutes"));
app.use("/product", require("./routes/Productroutes"));
app.use("/category", require("./routes/Categoryroutes"));
app.use("/wishlist", require("./routes/Wishlistroutes"));
app.use("/bag", require("./routes/Bagroutes"));
app.use("/order", require("./routes/OrderRoutes"));
app.use("/recent", require("./routes/Recentroutes"));
app.use("/recommend", require("./routes/Recommendationroutes"));
app.use("/transaction", require("./routes/TransactionRoutes"));

app.get("/", (req, res) => {
  res.send("Backend running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});