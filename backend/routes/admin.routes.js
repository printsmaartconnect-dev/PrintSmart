const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

// @route   GET api/admin/stats
// @desc    Get platform wide dashboard statistics
router.get("/stats", adminController.getDashboardStats);

// @route   GET api/admin/recent-orders
// @desc    Get recent orders across all shops
router.get("/recent-orders", adminController.getRecentOrders);

// @route   GET api/admin/users
// @desc    Get all platform users
router.get("/users", adminController.getUsers);

// @route   GET api/admin/shops
// @desc    Get all shops (shopkeepers)
router.get("/shops", adminController.getShops);

// @route   PUT api/admin/shops/:id/onboard
// @desc    Toggle shopkeeper onboarding/approval status
router.put("/shops/:id/onboard", adminController.toggleShopOnboard);

// @route   GET api/admin/analytics
// @desc    Get platform analytics data
router.get("/analytics", adminController.getAnalytics);

module.exports = router;
