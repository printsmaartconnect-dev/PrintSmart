const express = require("express");
const router = express.Router();
const multer = require("multer");
const fileController = require("../controllers/file.controller");

// Set up Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

router.post("/upload", upload.single("file"), fileController.upload);

module.exports = router;
