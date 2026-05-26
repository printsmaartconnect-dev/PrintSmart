const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// User routes
router.post("/create", userController.createUser);
router.get("/:userId", userController.getUserProfile);

module.exports = router;
