require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ROUTES
app.use("/user", require("./routes/Userroutes"));
app.use("/product", require("./routes/Productroutes"));
app.use("/category", require("./routes/Categoryroutes"));
app.use("/wishlist", require("./routes/Wishlistroutes"));
app.use("/bag", require("./routes/Bagroutes"));
app.use("/order", require("./routes/Orderroutes"));
app.use("/recent", require("./routes/Recentroutes"));
app.use("/recommend", require("./routes/Recommendationroutes"));
app.use("/transaction", require("./routes/Transactionroutes"));

app.get("/", (req, res) => {
  res.send("Backend running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});