const express = require("express");
const User = require("../models/user");
const Property = require("../models/property");
const Booking = require("../models/booking");
const Payment = require("../models/payment");
const FraudReport = require("../models/fraudereport");
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/role");

const router = express.Router();

router.get("/stats", auth, allowRoles("admin"), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    
    const totalProperties = await Property.countDocuments();
    const verifiedProperties = await Property.countDocuments({ isVerified: true });
    const blockedProperties = await Property.countDocuments({ flaggedAsFraud: true });
    const pendingProperties = await Property.countDocuments({ isVerified: false });
    
    const bookings = await Booking.countDocuments();
    const payments = await Payment.countDocuments();
    const frauds = await FraudReport.countDocuments();

    res.json({ 
      totalUsers, 
      verifiedUsers, 
      blockedUsers, 
      totalProperties, 
      verifiedProperties, 
      blockedProperties, 
      pendingProperties, 
      bookings, 
      payments, 
      frauds 
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats", error: error.message });
  }
});

router.get("/all/users", auth, allowRoles("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
});

router.get("/all/properties", auth, allowRoles("admin"), async (req, res) => {
  try {
    const properties = await Property.find().populate("ownerId", "fname email");
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch properties", error: error.message });
  }
});

router.patch("/verify/user/:id", auth, allowRoles("admin"), async (req, res) => {
  try {
    const { isVerified } = req.body;
    await User.findByIdAndUpdate(req.params.id, { isVerified: isVerified !== undefined ? isVerified : true });
    res.json({ message: isVerified === false ? "User unverified" : "User verified" });
  } catch (error) {
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
});

router.patch("/block/user/:id", auth, allowRoles("admin"), async (req, res) => {
  try {
    const { isBlocked } = req.body;
    await User.findByIdAndUpdate(req.params.id, { isBlocked: isBlocked !== undefined ? isBlocked : true });
    res.json({ message: isBlocked === false ? "User unblocked" : "User blocked" });
  } catch (error) {
    res.status(500).json({ message: "Operation failed", error: error.message });
  }
});

router.patch("/verify/property/:id", auth, allowRoles("admin"), async (req, res) => {
  try {
    const { isVerified } = req.body;
    await Property.findByIdAndUpdate(req.params.id, { isVerified: isVerified !== undefined ? isVerified : true });
    res.json({ message: isVerified === false ? "Property unverified" : "Property verified" });
  } catch (error) {
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
});

router.patch("/flag/property/:id", auth, allowRoles("admin"), async (req, res) => {
  try {
    const { flaggedAsFraud } = req.body;
    await Property.findByIdAndUpdate(req.params.id, { flaggedAsFraud: flaggedAsFraud !== undefined ? flaggedAsFraud : true });
    res.json({ message: flaggedAsFraud === false ? "Property unflagged" : "Property flagged" });
  } catch (error) {
    res.status(500).json({ message: "Flagging failed", error: error.message });
  }
});

router.get("/pending/bookings", auth, allowRoles("admin"), async (req, res) => {
  try {
    const bookings = await Booking.find({ isVerified: false })
      .populate("propertyId")
      .populate("buyerOrRenterId");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
});

router.patch("/verify/booking/:id", auth, allowRoles("admin"), async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, { isVerified: true });
    res.json({ message: "Booking verified" });
  } catch (error) {
    res.status(500).json({ message: "Booking verification failed", error: error.message });
  }
});

module.exports = router;