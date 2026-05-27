const express = require("express");
const router = express.Router();
const multer = require("multer");
const fileController = require("../controllers/file.controller");

// Set up Multer memory storage with 50MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Middleware wrapper to catch Multer errors (e.g. file size exceeded) gracefully
router.post(
  "/upload",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message: "File size exceeds the allowed limit of 50MB."
          });
        }
        return res.status(400).json({ message: `Upload configuration error: ${err.message}` });
      } else if (err) {
        return res.status(500).json({ message: `Upload process error: ${err.message}` });
      }
      next();
    });
  },
  fileController.upload
);

module.exports = router;
