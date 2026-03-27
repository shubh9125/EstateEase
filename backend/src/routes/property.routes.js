const express = require("express");
const Property = require("../models/property");
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const upload = require("../middleware/upload");

const router = express.Router();

// Create property
router.post("/", auth, allowRoles(["seller", "admin"]), async (req, res) => {
  try {
    const { title, description, price, city, address, type, propertyType } = req.body;

    if (!title || !description || !price || !city || !address) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const property = await Property.create({
      ownerId: req.user.userId,
      title,
      description,
      price,
      type: type || 'buy',
      propertyType: propertyType || 'house',
      location: {
        city,
        address
      },
      images: [] 
    });

    res.json({
      message: "Property created successfully",
      property
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create property", error: error.message });
  }
});

// Upload images for a property
router.post("/:id/upload", auth, allowRoles(["seller", "admin"]), upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.ownerId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to upload images for this property" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const imagePaths = req.files.map(file => `/uploads/properties/${file.filename}`);
    property.images.push(...imagePaths);
    await property.save();

    res.json({
      message: "Images uploaded successfully",
      property
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload images", error: error.message });
  }
});

// Get all properties
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find().populate("ownerId", "fname email phone");
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