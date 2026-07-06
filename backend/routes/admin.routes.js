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

// @route   GET api/admin/settings
// @desc    Get platform configurations
router.get("/settings", adminController.getSettings);

// @route   PUT api/admin/settings
// @desc    Update platform configurations
router.put("/settings", adminController.updateSettings);

// @route   GET api/admin/coupons
// @desc    Get scratch loyalty rewards telemetry
router.get("/coupons", adminController.getCoupons);

// @route   GET api/admin/tickets
// @desc    Get support/feedback tickets
router.get("/tickets", adminController.getTickets);

// @route   PUT api/admin/tickets/:id
// @desc    Update status of a feedback ticket
router.put("/tickets/:id", adminController.updateTicketStatus);

// @route   GET api/admin/ai-usage
// @desc    Get AI Studio usage telemetries
router.get("/ai-usage", adminController.getAIUsage);

module.exports = router;
