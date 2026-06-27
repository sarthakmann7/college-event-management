const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');

// @desc    Register student for an event
// @route   POST /api/events/:id/register
// @access  Private (Student, Admin, Club_Organizer)
const registerForEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user._id;

  try {
    // 1. Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // 2. Check if registration deadline has passed
    const now = new Date();
    if (event.registrationDeadline && now > new Date(event.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed for this event',
      });
    }

    // 3. Check if user is already registered in DB (prevent duplicates)
    const existingRegistration = await Registration.findOne({ user: userId, event: eventId });
    if (existingRegistration || event.registeredParticipants.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event',
      });
    }

    // 4. Check capacity constraints
    if (event.registeredParticipants.length >= event.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Registration failed: Event is at maximum capacity',
      });
    }

    // 5. Update Event and User atomically using findOneAndUpdate with condition checks
    // This double-checks capacity at the database level to prevent race conditions
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        registeredParticipants: { $ne: userId },
        $expr: { $lt: [{ $size: '$registeredParticipants' }, '$maxCapacity'] },
      },
      { $push: { registeredParticipants: userId } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(400).json({
        success: false,
        message: 'Registration failed: Event is full or you are already registered',
      });
    }

    // 6. Update User's registered events list
    await User.findByIdAndUpdate(userId, {
      $push: { registeredEvents: eventId },
    });

    // 7. Create Registration document
    const registration = await Registration.create({
      user: userId,
      event: eventId,
      timestamp: new Date(),
      attendanceStatus: 'Absent',
    });

    return res.status(201).json({
      success: true,
      message: 'Successfully registered for event',
      data: registration,
    });
  } catch (error) {
    console.error('Register For Event Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all participants registered for a specific event
// @route   GET /api/events/:id/participants
// @access  Private (Admin, Club_Organizer)
const getEventParticipants = async (req, res) => {
  const eventId = req.params.id;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Ensure requesting user is Admin or the organizer of the event
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view participants for this event (must be organizer or admin)',
      });
    }

    // Fetch registrations and populate user details
    const registrations = await Registration.find({ event: eventId })
      .populate('user', 'name email profilePicture')
      .sort({ timestamp: -1 });

    return res.json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error('Get Participants Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get currently logged-in student's registrations
// @route   GET /api/registrations/my
// @access  Private
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate({
        path: 'event',
        populate: { path: 'organizer', select: 'name email' },
      })
      .sort({ timestamp: -1 });

    return res.json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error('Get My Registrations Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle attendance status for a participant
// @route   PUT /api/events/:id/attendance/:registrationId
// @access  Private (Admin, Club_Organizer)
const updateAttendanceStatus = async (req, res) => {
  const { id: eventId, registrationId } = req.params;
  const { attendanceStatus } = req.body; // 'Attended' or 'Absent'

  if (!['Attended', 'Absent'].includes(attendanceStatus)) {
    return res.status(400).json({ success: false, message: 'Invalid attendance status' });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Verify authorized roles (Admin or Creator)
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update attendance (must be organizer or admin)',
      });
    }

    const registration = await Registration.findOneAndUpdate(
      { _id: registrationId, event: eventId },
      { attendanceStatus },
      { new: true }
    ).populate('user', 'name email');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found for this event',
      });
    }

    return res.json({
      success: true,
      message: `Attendance updated to ${attendanceStatus}`,
      data: registration,
    });
  } catch (error) {
    console.error('Update Attendance Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerForEvent,
  getEventParticipants,
  getMyRegistrations,
  updateAttendanceStatus,
};
