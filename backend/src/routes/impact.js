const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const impactController = require('../controllers/impactController');

// Public routes (stats, distributions, news, events) – require authentication for user‑specific actions only
router.get('/stats', protect, impactController.getImpactStats);
router.get('/distributions', protect, impactController.getDistributions);
router.get('/news', impactController.getNews); // public read
router.get('/events', protect, impactController.getEvents);
router.post('/events/:id/register', protect, impactController.registerEvent);

module.exports = router;
