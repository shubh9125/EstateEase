require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const propertyRoutes = require("./routes/property.routes");
const bookingRoutes = require("./routes/booking.routes");
const fraudRoutes = require("./routes/fraud.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();
const path = require('path');
const fs = require('fs');

app.use(cors());
app.use(express.json());

// Serving static files from the absolute path with proper headers
const uploadsDir = path.resolve(__dirname, '../uploads');

// Ensure uploads directory exists
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(path.join(uploadsDir, 'properties'), { recursive: true });

app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Add a test route for checking if static files are accessible
app.get("/check-uploads", (req, res) => {
  const propertiesDir = path.join(uploadsDir, 'properties');
  if (fs.existsSync(propertiesDir)) {
    const files = fs.readdirSync(propertiesDir);
    res.json({ 
      status: "Uploads directory found", 
      path: uploadsDir,
      propertiesPath: propertiesDir,
      fileCount: files.length,
      files: files.slice(0, 5) 
    });
  } else {
    res.status(404).json({ 
      status: "Uploads directory NOT found", 
      path: uploadsDir,
      cwd: process.cwd()
    });
  }
});

connectDB();

app.get("/", (req, res) => {
  res.send("Server running");
});

app.get("/test-route", (req, res) => {
  res.send("Test route working");
});

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/fraud", fraudRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});