const express = require('express');
const router = express.Router();
const horoscopeController = require('../controllers/horoscope.controller');
const auth = require('../middleware/auth');

// Get today's horoscope for the authenticated user
router.get('/daily', auth.authenticateToken, horoscopeController.getDailyHoroscope);

// Get horoscope history for the authenticated user
router.get('/history', auth.authenticateToken, horoscopeController.getHoroscopeHistory);

module.exports = router;
