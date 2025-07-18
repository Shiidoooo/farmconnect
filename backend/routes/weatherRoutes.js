const express = require('express');
const weatherController = require('../controllers/weatherController');

const router = express.Router();

// Get weather forecast (current + hourly + daily)
router.get('/forecast', weatherController.getWeatherForecast);

// Get weather alerts
router.get('/alerts', weatherController.getWeatherAlerts);

module.exports = router;
