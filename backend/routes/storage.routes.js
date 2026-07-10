const express = require("express");
const router = express.Router();
const storageController = require("../controllers/storage.controller");

// Route to get folders eligible for cleanup
router.get("/cleanup", storageController.getCleanupFolders);
// Route to mark orders as cleaned in database after successful folder deletions
router.post("/cleanup", storageController.markCleaned);

module.exports = router;
