const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { getUserReports, generatePDFReport } = require('../controllers/reportsController');

// Get user's reports and analytics
router.get('/user', authenticateUser, getUserReports);

// Generate PDF report
router.get('/pdf', authenticateUser, generatePDFReport);

module.exports = router;
