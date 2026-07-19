const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Public shopkeeper routes
router.get("/search", authController.searchShops);
router.get("/by-slug/:slug", authController.getShopkeeperBySlug);

// Protected shopkeeper routes
router.get("/me/qr", authMiddleware, authController.getMeQr);
router.get("/announcements", authMiddleware, authController.getAnnouncements);

module.exports = router;
