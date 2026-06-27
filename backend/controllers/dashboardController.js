const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');

// @desc    Get aggregated stats for dashboard
// @route   GET /api/dashboard/stats
// @access  Private (Admin, Club_Organizer)
const getDashboardStats = async (req, res) => {
  try {
    const isGlobalAdmin = req.user.role === 'Admin';
    
    // Define scopes
    let eventQuery = {};
    if (!isGlobalAdmin) {
      eventQuery.organizer = req.user._id; // Club Organizer can only see stats for their own events
    }

    // 1. Fetch Events
    const events = await Event.find(eventQuery).populate('organizer', 'name email');
    const totalEvents = events.length;

    // 2. Fetch Users count (Global counts only for Admins)
    let totalUsers = 0;
    let roleBreakdown = { Student: 0, Club_Organizer: 0, Admin: 0 };
    if (isGlobalAdmin) {
      totalUsers = await User.countDocuments();
      roleBreakdown.Student = await User.countDocuments({ role: 'Student' });
      roleBreakdown.Club_Organizer = await User.countDocuments({ role: 'Club_Organizer' });
      roleBreakdown.Admin = await User.countDocuments({ role: 'Admin' });
    } else {
      // For Club Organizers, just calculate count of unique students registered to their events
      const eventIds = events.map(e => e._id);
      const uniqueParticipants = await Registration.distinct('user', { event: { $in: eventIds } });
      totalUsers = uniqueParticipants.length;
      roleBreakdown.Student = totalUsers;
    }

    // 3. Fetch Registrations count
    let totalRegistrations = 0;
    let registrationsBreakdown = [];
    
    if (isGlobalAdmin) {
      totalRegistrations = await Registration.countDocuments();
    } else {
      const eventIds = events.map(e => e._id);
      totalRegistrations = await Registration.countDocuments({ event: { $in: eventIds } });
    }

    // 4. Event-wise breakdown
    const eventBreakdown = events.map(event => {
      const registeredCount = event.registeredParticipants.length;
      const capacityPercentage = event.maxCapacity > 0 ? Math.round((registeredCount / event.maxCapacity) * 100) : 0;
      return {
        _id: event._id,
        title: event.title,
        category: event.category,
        date: event.date,
        venue: event.venue,
        maxCapacity: event.maxCapacity,
        registeredCount,
        capacityPercentage,
      };
    });

    // 5. Category-wise breakdown
    const categoryStats = { Technical: 0, Cultural: 0, Sports: 0 };
    events.forEach(event => {
      if (categoryStats[event.category] !== undefined) {
        categoryStats[event.category] += event.registeredParticipants.length;
      }
    });

    return res.json({
      success: true,
      data: {
        isGlobalAdmin,
        stats: {
          totalEvents,
          totalUsers,
          totalRegistrations,
        },
        roleBreakdown,
        categoryStats,
        eventBreakdown,
      },
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
};
