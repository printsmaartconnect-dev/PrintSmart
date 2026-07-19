const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const feedbackController = require("../controllers/feedback.controller");

// @route   GET api/admin/stats
router.get("/stats", adminController.getDashboardStats);

// @route   GET api/admin/recent-orders
router.get("/recent-orders", adminController.getRecentOrders);

// @route   GET /api/admin/settings
router.get("/settings", adminController.getSettings);
router.post("/settings", adminController.saveSettings);

// @route   CRUD for shops
router.get("/shops", adminController.getShops);
router.post("/shops", adminController.createShop);
router.get("/shops/:id/orders-detail", adminController.getShopOrdersDetail);
router.put("/shops/:id", adminController.updateShop);
router.delete("/shops/:id", adminController.deleteShop);
router.put("/shops/:id/onboard", adminController.toggleShopOnboard);

// @route   CRUD for users (customers)
router.get("/users", adminController.getUsers);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

// @route   CRUD for coupons/rewards
router.get("/coupons", adminController.getCoupons);
router.post("/coupons", adminController.createCoupon);
router.put("/coupons/:id", adminController.updateCoupon);
router.delete("/coupons/:id", adminController.deleteCoupon);

// @route   CRUD for feedback (support tickets)
router.get("/feedback", feedbackController.getAllFeedback);
router.put("/feedback/:feedbackId", feedbackController.updateFeedbackStatus);
router.delete("/feedback/:feedbackId", feedbackController.deleteFeedback);

// @route   GET api/admin/analytics
router.get("/analytics", adminController.getAnalytics);

// @route   GET api/admin/growth
router.get("/growth", adminController.getPlatformGrowth);

// @route   Announcements
router.post("/announcements", adminController.createAnnouncement);
router.get("/announcements", adminController.getAnnouncements);
router.delete("/announcements/:id", adminController.deleteAnnouncement);

module.exports = router;
