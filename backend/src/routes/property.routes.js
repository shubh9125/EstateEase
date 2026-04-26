const express = require("express");
const Property = require("../models/property");
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const upload = require("../middleware/upload");
const { detectAnomaly } = require("../ml/anomalyDetector");

const router = express.Router();

/*
  Decision policy
  ----------------
  Safe listing:
    - auto approved
    - isVerified = true
    - reviewStatus = "approved"

  Medium risk listing:
    - sent to admin review
    - isVerified = false
    - reviewStatus = "pending"

  High risk listing:
    - auto flagged / auto rejected
    - isVerified = false
    - flaggedAsFraud = true
    - reviewStatus = "rejected"
*/

function evaluatePropertyRisk({
  title,
  description,
  price,
  sellerListingCount,
  imageCount,
  anomalyResult
}) {
  let riskScore = 0;
  const reasons = [];

  // ---------- Rule-based checks ----------
  if (title.trim().length < 5) {
    riskScore += 0.15;
    reasons.push("Title is too short");
  }

  if (description.trim().length < 20) {
    riskScore += 0.20;
    reasons.push("Description is too short");
  }

  if (sellerListingCount >= 10) {
    riskScore += 0.20;
    reasons.push("Seller has unusually high number of listings");
  }

  if (imageCount === 0) {
    riskScore += 0.15;
    reasons.push("No images uploaded");
  }

  if (price < 50000) {
    riskScore += 0.20;
    reasons.push("Price looks unusually low");
  }

  // ---------- ML anomaly result ----------
  if (anomalyResult?.isAnomaly) {
    riskScore += 0.35;
    reasons.push(anomalyResult.reason || "ML model detected anomaly");
  }

  // Keep final score between 0 and 1
  riskScore = Math.min(1, Number(riskScore.toFixed(2)));

  // ---------- Auto decision ----------
  let isVerified = false;
  let flaggedAsFraud = false;
  let reviewStatus = "pending";
  let finalReason = reasons.join(", ");

  if (riskScore < 0.30) {
    isVerified = true;
    flaggedAsFraud = false;
    reviewStatus = "approved";
    finalReason = finalReason || "Auto-approved: low risk listing";
  } else if (riskScore >= 0.30 && riskScore < 0.60) {
    isVerified = false;
    flaggedAsFraud = false;
    reviewStatus = "pending";
    finalReason = finalReason || "Needs admin review: medium risk listing";
  } else {
    isVerified = false;
    flaggedAsFraud = true;
    reviewStatus = "rejected";
    finalReason = finalReason || "Auto-rejected: high risk listing";
  }

  return {
    fraudScore: riskScore,
    flaggedAsFraud,
    isVerified,
    reviewStatus,
    fraudReason: finalReason
  };
}

// Create property
router.post("/", auth, allowRoles(["seller", "admin"]), async (req, res) => {
  try {
    const { title, description, price, city, address, type, propertyType, lat, lng } = req.body;

    if (!title || !description || !price || !city || !address) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: "Price must be a valid positive number" });
    }

    const sellerListingCount = await Property.countDocuments({ ownerId: req.user.userId });

    // ML anomaly check
    let anomalyResult = {
      isAnomaly: false,
      score: 0,
      reason: "Normal listing"
    };

    try {
      anomalyResult = await detectAnomaly({
        title,
        description,
        price: numericPrice,
        city,
        propertyType: propertyType || "house",
        imageCount: 0,
        sellerListingCount
      });
    } catch (mlError) {
      console.error("ML detection skipped:", mlError.message);
    }

    const autoDecision = evaluatePropertyRisk({
      title,
      description,
      price: numericPrice,
      sellerListingCount,
      imageCount: 0,
      anomalyResult
    });

    const property = await Property.create({
      ownerId: req.user.userId,
      title,
      description,
      price: numericPrice,
      type: type || "buy",
      propertyType: propertyType || "house",
      location: {
        city,
        address,
        coordinates: {
          lat: lat ? Number(lat) : undefined,
          lng: lng ? Number(lng) : undefined
        }
      },
      images: [],
      flaggedAsFraud: autoDecision.flaggedAsFraud,
      fraudScore: autoDecision.fraudScore,
      fraudReason: autoDecision.fraudReason,
      isVerified: autoDecision.isVerified,
      reviewStatus: autoDecision.reviewStatus
    });

    let message = "Property submitted successfully";

    if (autoDecision.reviewStatus === "approved") {
      message = "Property auto-approved successfully";
    } else if (autoDecision.reviewStatus === "pending") {
      message = "Property submitted and sent for admin review";
    } else if (autoDecision.reviewStatus === "rejected") {
      message = "Property automatically flagged as suspicious";
    }

    res.json({
      message,
      property,
      fraudCheck: anomalyResult,
      autoDecision
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create property", error: error.message });
  }
});

// Upload images for a property
router.post("/:id/upload", auth, allowRoles(["seller", "admin"]), upload.array("images", 10), async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.ownerId.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to upload images for this property" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    console.log(`[IMAGE UPLOAD] Property: ${id}, Files uploaded: ${req.files.length}`);
    
    const imagePaths = req.files.map((file) => {
      const imgPath = `/uploads/properties/${file.filename}`;
      console.log(`[IMAGE UPLOAD] File saved: ${file.filename} -> ${imgPath}`);
      return imgPath;
    });
    
    property.images.push(...imagePaths);
    console.log(`[IMAGE UPLOAD] Total images now: ${property.images.length}`);

    const sellerListingCount = await Property.countDocuments({ ownerId: property.ownerId });

    let anomalyResult = {
      isAnomaly: false,
      score: 0,
      reason: "Normal listing"
    };

    try {
      anomalyResult = await detectAnomaly({
        title: property.title,
        description: property.description,
        price: property.price,
        city: property.location.city,
        propertyType: property.propertyType || "house",
        imageCount: property.images.length,
        sellerListingCount
      });
    } catch (mlError) {
      console.error("ML re-check skipped after image upload:", mlError.message);
    }

    const autoDecision = evaluatePropertyRisk({
      title: property.title,
      description: property.description,
      price: property.price,
      sellerListingCount,
      imageCount: property.images.length,
      anomalyResult
    });

    property.flaggedAsFraud = autoDecision.flaggedAsFraud;
    property.fraudScore = autoDecision.fraudScore;
    property.fraudReason = autoDecision.fraudReason;
    property.isVerified = autoDecision.isVerified;
    property.reviewStatus = autoDecision.reviewStatus;

    await property.save();
    
    console.log(`[IMAGE UPLOAD] Property saved successfully with ${property.images.length} images`);

    res.json({
      message: "Images uploaded and property re-evaluated successfully",
      property,
      fraudCheck: anomalyResult,
      autoDecision
    });
  } catch (error) {
    console.error(`[IMAGE UPLOAD ERROR] ${error.message}`, error);
    res.status(500).json({ message: "Failed to upload images", error: error.message });
  }
});

// Get all verified properties
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find({
      flaggedAsFraud: false
    }).populate("ownerId", "fname email phone");

    res.json({ properties });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch properties", error: error.message });
  }
});

// Get seller's own properties
router.get("/my", auth, allowRoles(["seller", "admin"]), async (req, res) => {
  try {
    const properties = await Property.find({ ownerId: req.user.userId });
    res.json({ properties });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch seller properties", error: error.message });
  }
});

module.exports = router;