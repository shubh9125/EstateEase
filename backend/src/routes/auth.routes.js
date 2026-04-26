const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

console.log("auth.routes.js loaded");

router.get("/check", (req, res) => {
  res.json({ message: "Auth route working" });
});

router.post("/register", async (req, res) => {
  try {
    console.log("Register route hit");
    const { fname, email, phone, password, role } = req.body;

    if (!fname || !email || !phone || !password || !role) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fname: fname,
      email: email,
      phone: phone,
      password: hashedPassword,
      role: role,
      isVerified: false,
      isBlocked: false
    });

    res.json({
      message: "Registered. Wait for admin verification.",
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ message: "Register failed", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

module.exports = router;