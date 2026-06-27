const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const {
  registerForEvent,
  getEventParticipants,
  updateAttendanceStatus,
} = require('../controllers/registrationController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected routes (Student, Admin, Organizer)
router.post('/:id/register', verifyToken, registerForEvent);

// Restricted routes (Admin, Club_Organizer only)
router.post('/', verifyToken, checkRole(['Admin', 'Club_Organizer']), createEvent);
router.put('/:id', verifyToken, checkRole(['Admin', 'Club_Organizer']), updateEvent);
router.delete('/:id', verifyToken, checkRole(['Admin', 'Club_Organizer']), deleteEvent);

router.get('/:id/participants', verifyToken, checkRole(['Admin', 'Club_Organizer']), getEventParticipants);
router.put('/:id/attendance/:registrationId', verifyToken, checkRole(['Admin', 'Club_Organizer']), updateAttendanceStatus);

module.exports = router;
