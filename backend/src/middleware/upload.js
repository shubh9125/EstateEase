// backend/src/middleware/upload.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(__dirname, "../../uploads/properties");

// Ensure directory exists with proper permissions
try {
  fs.mkdirSync(uploadPath, { recursive: true, mode: 0o755 });
  console.log(`Upload directory ready at: ${uploadPath}`);
} catch (err) {
  console.error(`Failed to create upload directory: ${err.message}`);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Double-check directory exists before each upload
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = function (req, file, cb) {
  const allowed = /jpg|jpeg|png|webp/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error("Only jpg, jpeg, png, webp files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;