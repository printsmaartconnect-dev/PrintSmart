const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statistics.controller');

/**
 * GET /api/statistics/:shopkeeperId
 * Get overall shopkeeper statistics
 */
router.get('/:shopkeeperId', statisticsController.getStatistics);

/**
 * GET /api/statistics/:shopkeeperId/daily/:date?
 * Get daily statistics for a specific shopkeeper
 */
router.get('/:shopkeeperId/daily/:date?', statisticsController.getDailyStats);

/**
 * GET /api/statistics/:shopkeeperId/weekly
 * Get weekly statistics for a specific shopkeeper
 */
router.get('/:shopkeeperId/weekly', statisticsController.getWeeklyStats);

/**
 * GET /api/statistics/:shopkeeperId/monthly/:month/:year?
 * Get monthly statistics for a specific shopkeeper
 */
router.get('/:shopkeeperId/monthly/:month/:year?', statisticsController.getMonthlyStats);

module.exports = router;
