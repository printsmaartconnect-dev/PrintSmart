const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const authMiddleware = require("../middleware/auth.middleware");

// All AI Marketing Studio routes are protected
router.post("/suggest-prompt", authMiddleware, aiController.suggestPrompt);
router.post("/generate", authMiddleware, aiController.generatePoster);
router.post("/regenerate", authMiddleware, aiController.regeneratePoster);
router.post("/chat-generate", authMiddleware, aiController.chatGenerate);
router.get("/history", authMiddleware, aiController.getHistory);

// AI Copilot Business Dashboard & Chat Endpoints
const aiCopilotController = require("../dist/ai/ai.controller").AICopilotController;
router.get("/copilot-dashboard", authMiddleware, aiCopilotController.getDashboardData);
router.post("/copilot-chat", authMiddleware, aiCopilotController.chat);
router.post("/recommendations/apply", authMiddleware, aiCopilotController.applyRecommendation);

module.exports = router;
