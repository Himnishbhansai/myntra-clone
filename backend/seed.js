require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Product = require("./models/Product");
const Category = require("./models/Category");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Mongo connected");

    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});

    const hashedPassword = await bcrypt.hash("123456", 10);

    await User.insertMany([
      {
        fullName: "Himnish",
        email: "test@gmail.com",
        password: hashedPassword,
      },
      {
        fullName: "Tony Stark",
        email: "ironman@gmail.com",
        password: hashedPassword,
      },
    ]);

    await Category.insertMany([
      {
        name: "Men",
        image:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f"
      },
      {
        name: "Women",
        image:
          "https://images.unsplash.com/photo-1483985988355-763728e1935b"
      }
    ]);

    console.log("Data inserted");

    process.exit();
  })
  .catch((err) => console.log(err));