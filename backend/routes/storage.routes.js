const express = require("express");
const router = express.Router();
const storageController = require("../controllers/storage.controller");

// Route to get folders eligible for cleanup
router.get("/cleanup", storageController.getCleanupFolders);

module.exports = router;
