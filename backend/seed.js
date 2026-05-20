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

    // साफ reset
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});

    const hashedPassword = await bcrypt.hash("123456", 10);

    // 👤 USERS
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

    // 📂 CATEGORIES
    const categories = await Category.insertMany([
      {
        name: "Men",
        image:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
      },
      {
        name: "Women",
        image:
          "https://images.unsplash.com/photo-1483985988355-763728e1935b",
      },
    ]);

    // 🛍️ PRODUCTS (IMPORTANT PART)
    await Product.insertMany([
      // 👕 TSHIRTS
      {
        name: "Black Cotton T-Shirt",
        brand: "H&M",
        price: 599,
        category: "tshirt",
        images: ["https://picsum.photos/300?random=1"],
        stock: 20,
        sizes: ["S", "M", "L"],
      },
      {
        name: "White Oversized Tee",
        brand: "Zara",
        price: 799,
        category: "tshirt",
        images: ["https://picsum.photos/300?random=2"],
        stock: 15,
        sizes: ["M", "L"],
      },

      // 👖 JEANS
      {
        name: "Slim Fit Jeans",
        brand: "Levis",
        price: 1999,
        category: "jeans",
        images: ["https://picsum.photos/300?random=3"],
        stock: 10,
        sizes: ["30", "32", "34"],
      },
      {
        name: "Blue Straight Jeans",
        brand: "Wrangler",
        price: 1799,
        category: "jeans",
        images: ["https://picsum.photos/300?random=4"],
        stock: 12,
        sizes: ["30", "32"],
      },

      // 👟 SHOES
      {
        name: "Running Shoes",
        brand: "Nike",
        price: 2999,
        category: "shoes",
        images: ["https://picsum.photos/300?random=5"],
        stock: 8,
        sizes: ["7", "8", "9"],
      },
      {
        name: "Casual Sneakers",
        brand: "Puma",
        price: 2499,
        category: "shoes",
        images: ["https://picsum.photos/300?random=6"],
        stock: 14,
        sizes: ["7", "8"],
      },

      // 👔 SHIRTS
      {
        name: "Formal White Shirt",
        brand: "Van Heusen",
        price: 1599,
        category: "shirt",
        images: ["https://picsum.photos/300?random=7"],
        stock: 18,
        sizes: ["S", "M", "L"],
      },
      {
        name: "Casual Checked Shirt",
        brand: "Roadster",
        price: 1299,
        category: "shirt",
        images: ["https://picsum.photos/300?random=8"],
        stock: 20,
        sizes: ["M", "L"],
      },

      // 🧥 JACKETS / HOODIES
      {
        name: "Winter Jacket",
        brand: "Adidas",
        price: 3499,
        category: "jacket",
        images: ["https://picsum.photos/300?random=9"],
        stock: 6,
        sizes: ["M", "L"],
      },
      {
        name: "Grey Hoodie",
        brand: "Uniqlo",
        price: 1599,
        category: "hoodie",
        images: ["https://picsum.photos/300?random=10"],
        stock: 16,
        sizes: ["S", "M", "L"],
      },
    ]);

    console.log("✅ Data inserted successfully");

    process.exit();
  })
  .catch((err) => console.log(err));