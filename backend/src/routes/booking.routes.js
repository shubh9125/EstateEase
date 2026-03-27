const express = require("express");
const Booking = require("../models/booking");
const Property = require("../models/property");
const authMiddleware = require("../middleware/auth");
const allowRoles = require("../middleware/role");

const router = express.Router();

// Create a new booking
router.post("/", authMiddleware, allowRoles(["buyer", "renter"]), async (req, res) => {
  try {
    const { propertyId, message } = req.body;

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const bookingtype = req.user.role === "buyer" ? "buy" : "rent";

    const booking = await Booking.create({
      propertyId,
      buyerOrRenterId: req.user.userId,
      bookingtype,
      message,
      status: "pending",
      isVerified: false
    });

    res.json({
      message: "Booking request sent successfully",
      booking
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/seller/inbox", authMiddleware, allowRoles(["seller"]), async (req, res) => {
  try {
    const properties = await Property.find({ ownerId: req.user.userId }).select("_id");
    const ids = properties.map((item) => item._id);

    const bookings = await Booking.find({ propertyId: { $in: ids } })
      .populate("propertyId", "title")
      .populate("buyerOrRenterId", "fname email phone");

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;