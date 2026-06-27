const express = require('express');
const router = express.Router();
const { getMyRegistrations } = require('../controllers/registrationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/my', verifyToken, getMyRegistrations);

module.exports = router;
