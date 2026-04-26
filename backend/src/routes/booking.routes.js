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

router.get("/user/inbox", authMiddleware, allowRoles(["buyer", "renter"]), async (req, res) => {
  try {
    const bookings = await Booking.find({ buyerOrRenterId: req.user.userId })
      .populate({
        path: "propertyId",
        select: "title ownerId",
        populate: {
          path: "ownerId",
          select: "fname email phone"
        }
      });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Seller reply to a booking request
router.patch("/:id/reply", authMiddleware, allowRoles(["seller"]), async (req, res) => {
  try {
    const { sellerReply, status } = req.body;
    const booking = await Booking.findById(req.params.id).populate("propertyId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if the property owner is the one replying
    if (booking.propertyId.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to reply to this request" });
    }

    if (sellerReply !== undefined) booking.sellerReply = sellerReply;
    if (status !== undefined) booking.status = status;

    await booking.save();

    res.json({ message: "Reply sent successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Buyer/Renter follow-up reply
router.patch("/:id/follow-up", authMiddleware, allowRoles(["buyer", "renter"]), async (req, res) => {
  try {
    const { buyerReply } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.buyerOrRenterId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to reply to this request" });
    }

    booking.buyerReply = buyerReply;
    await booking.save();

    res.json({ message: "Follow-up sent successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;