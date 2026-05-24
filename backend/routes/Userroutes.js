const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();


// ================= SIGNUP =================
router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    // check existing user
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    // remove password before sending
    const { password: _, ...userData } =
      user.toObject();

    return res.status(201).json({
      message: "Signup successful",
      user: userData,
    });
  } catch (error) {
    console.log("Signup error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // remove password
    const { password: _, ...userData } =
      user.toObject();

    return res.status(200).json({
      message: "Login successful",
      user: userData,
    });
  } catch (error) {
    console.log("Login error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.post("/save-token", async (req, res) => {
  try {
    const { userId, token } = req.body;

    await User.findByIdAndUpdate(userId, {
      expoPushToken: token,
    });

    res.json({ success: true });
  } catch (err) {
    console.log("Token save error:", err);
    res.status(500).json({ message: "Error saving token" });
  }
});

module.exports = router;