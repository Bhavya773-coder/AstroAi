const express = require('express');
const router = express.Router();
const horoscopeController = require('../controllers/horoscope.controller');
const { requireAuth } = require('../middleware/auth');

// Get today's horoscope for the authenticated user
router.get('/daily', requireAuth, horoscopeController.getDailyHoroscope);

// Refresh today's horoscope (generate fresh AI horoscope)
router.post('/refresh', requireAuth, horoscopeController.refreshDailyHoroscope);

// Get horoscope history for the authenticated user
router.get('/history', requireAuth, horoscopeController.getHoroscopeHistory);

module.exports = router;
