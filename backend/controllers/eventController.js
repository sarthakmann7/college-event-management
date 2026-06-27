const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Admin, Club_Organizer)
const createEvent = async (req, res) => {
  const { title, description, category, venue, date, registrationDeadline, maxCapacity, bannerImageUrl } = req.body;

  try {
    const event = await Event.create({
      title,
      description,
      organizer: req.user._id,
      category,
      venue,
      date,
      registrationDeadline,
      maxCapacity,
      bannerImageUrl: bannerImageUrl || '',
      registeredParticipants: [],
    });

    return res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Create Event Error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all events (with search & filtering)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  const { search, category, status } = req.query;

  try {
    let query = {};

    // Search filter (title, description, venue)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Status filter (Live/Upcoming, Past)
    const now = new Date();
    if (status === 'Upcoming') {
      query.date = { $gte: now };
    } else if (status === 'Past') {
      query.date = { $lt: now };
    } else if (status === 'Live') {
      // Event happening today/currently
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 }); // Sort by date ascending

    return res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error('Get Events Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    return res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Get Event By ID Error:', error);
    return res.status(500).json({ success: false, message: 'Invalid Event ID or Server Error' });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Admin, Club_Organizer)
const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user is event organizer or Admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event (must be organizer or admin)',
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('organizer', 'name email');

    return res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Update Event Error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Admin, Club_Organizer)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user is event organizer or Admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event (must be organizer or admin)',
      });
    }

    // Remove the event
    await Event.findByIdAndDelete(req.params.id);

    // Clean up Registrations associated with this event
    await Registration.deleteMany({ event: req.params.id });

    // Clean up User registeredEvents arrays
    await User.updateMany(
      { registeredEvents: req.params.id },
      { $pull: { registeredEvents: req.params.id } }
    );

    return res.json({
      success: true,
      message: 'Event and associated registrations deleted successfully',
    });
  } catch (error) {
    console.error('Delete Event Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
