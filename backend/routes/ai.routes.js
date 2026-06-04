const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const authMiddleware = require("../middleware/auth.middleware");

// All AI Marketing Studio routes are protected
router.post("/suggest-prompt", authMiddleware, aiController.suggestPrompt);
router.post("/generate", authMiddleware, aiController.generatePoster);
router.post("/regenerate", authMiddleware, aiController.regeneratePoster);
router.get("/history", authMiddleware, aiController.getHistory);

module.exports = router;
