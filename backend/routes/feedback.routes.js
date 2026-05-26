const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');

/**
 * POST /api/feedback/submit
 * Submit a feedback/support ticket
 */
router.post('/submit', feedbackController.submitFeedback);

/**
 * GET /api/feedback/user/:userId
 * Get feedback history for a specific user
 */
router.get('/user/:userId', feedbackController.getUserFeedback);

/**
 * GET /api/feedback/all
 * Get all feedback (admin only)
 */
router.get('/all', feedbackController.getAllFeedback);

/**
 * PUT /api/feedback/:feedbackId/status
 * Update feedback status (admin only)
 */
router.put('/:feedbackId/status', feedbackController.updateFeedbackStatus);

/**
 * DELETE /api/feedback/:feedbackId
 * Delete feedback (admin only)
 */
router.delete('/:feedbackId', feedbackController.deleteFeedback);

module.exports = router;
