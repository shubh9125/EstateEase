const express = require("express");
const Payment = require("../models/payment");
const Booking = require("../models/booking");
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/role");

const router = express.Router();

// Create payment
router.post("/", auth, allowRoles(["buyer", "renter"]), async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod, transactionId } = req.body;

    if (!bookingId || !amount || !paymentMethod) {
      return res.status(400).json({ message: "bookingId, amount and paymentMethod are required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const payment = await Payment.create({
      bookingId,
      amount,
      paymentMethod,
      transactionId: transactionId || "",
      status: "completed"
    });

    res.json({
      message: "Payment successful",
      payment
    });
  } catch (error) {
    res.status(500).json({ message: "Payment failed", error: error.message });
  }
});

// Get all payments of logged in user
router.get("/", auth, async (req, res) => {
  try {
    const payments = await Payment.find().populate("bookingId");
    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payments", error: error.message });
  }
});

module.exports = router;