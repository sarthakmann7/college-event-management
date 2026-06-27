const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/stats', verifyToken, checkRole(['Admin', 'Club_Organizer']), getDashboardStats);

module.exports = router;
