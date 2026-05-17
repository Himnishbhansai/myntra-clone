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


// ===== IMPORT ROUTES =====
const userRoutes = require("./routes/Userroutes.js");
const productRoutes = require("./routes/Productroutes.js");
const categoryRoutes = require("./routes/Categoryroutes.js");
const wishlistRoutes = require("./routes/Wishlistroutes.js");
const bagRoutes = require("./routes/Bagroutes.js");
const orderRoutes = require("./routes/OrderRoutes.js");


// ===== USE ROUTES =====
app.use("/user", userRoutes);
app.use("/product", productRoutes);
app.use("/category", categoryRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/bag", bagRoutes);
app.use("/order", orderRoutes);


app.get("/", (req,res)=>{
    res.send("Backend running");
});

const PORT=process.env.PORT||5000;

app.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`);
});