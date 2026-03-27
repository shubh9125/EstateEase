const express = require("express");
const FraudReport = require("../models/fraudereport");
const Property = require("../models/property");
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/role");

const router = express.Router();

router.post("/", auth, allowRoles(["buyer", "renter"]), async (req, res) => {
  try {
    const { propertyId, reason } = req.body;

    if (!propertyId || !reason) {
      return res.status(400).json({ message: "propertyId and reason are required" });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const report = await FraudReport.create({
      propertyId,
      reportedBy: req.user.userId,
      reason,
      status: "pending"
    });

    await Property.findByIdAndUpdate(propertyId, { flaggedAsFraud: true });

    res.json({
      message: "Fraud report submitted successfully",
      report
    });
  } catch (error) {
    res.status(500).json({ message: "Fraud report failed", error: error.message });
  }
});

module.exports = router;