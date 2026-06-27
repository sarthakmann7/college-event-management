import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Ticket,
  Plus,
  Edit2,
  Trash2,
  ListOrdered,
  RefreshCw,
  TrendingUp,
  MapPin,
  Clock,
} from 'lucide-react';
import EventModal from '../components/EventModal';
import ParticipantTrackerModal from '../components/ParticipantTrackerModal';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = ({ onShowToast }) => {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [activeEventForEdit, setActiveEventForEdit] = useState(null);
  const [activeEventForTracker, setActiveEventForTracker] = useState(null);

  // Fetch metrics & breakdown list
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/dashboard/stats');
      if (res.data.success) {
        setStatsData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve dashboard reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle delete event
  const handleDeleteEvent = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This will cancel all registered tickets.`)) {
      return;
    }

    try {
      const res = await axios.delete(`/api/events/${eventId}`);
      if (res.data.success) {
        onShowToast(res.data.message || 'Event deleted successfully!');
        fetchDashboardData();
      }
    } catch (err) {
      onShowToast(err.response?.data?.message || 'Failed to delete event.', 'error');
    }
  };

  const handleOpenCreateModal = () => {
    setActiveEventForEdit(null);
    setIsEventModalOpen(true);
  };

  const handleOpenEditModal = (eventObj) => {
    setActiveEventForEdit(eventObj);
    setIsEventModalOpen(true);
  };

  const handleCloseEventModal = () => {
    setIsEventModalOpen(false);
    setActiveEventForEdit(null);
  };

  const handleSaveSuccess = (savedEvent, message) => {
    onShowToast(message);
    handleCloseEventModal();
    fetchDashboardData();
  };

  if (loading && !statsData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading management console reports...</p>
      </div>
    );
  }

  const { stats = {}, roleBreakdown = {}, categoryStats = {}, eventBreakdown = [], isGlobalAdmin } = statsData || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100">Management Console</h1>
            <p className="text-xs text-slate-400">
              {isGlobalAdmin ? 'Global Administrative Panel' : 'Club Organizer Panel'} & Analytics
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Host Event</span>
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Events */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl glass flex items-center space-x-4">
          <div className="p-3 bg-indigo-600/15 rounded-xl border border-indigo-500/20">
            <Calendar className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Hosted Events</p>
            <p className="text-3xl font-black text-slate-100 mt-1">{stats.totalEvents || 0}</p>
          </div>
        </div>

        {/* Card 2: Registrations */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl glass flex items-center space-x-4">
          <div className="p-3 bg-pink-600/15 rounded-xl border border-pink-500/20">
            <Ticket className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Admissions</p>
            <p className="text-3xl font-black text-slate-100 mt-1">{stats.totalRegistrations || 0}</p>
          </div>
        </div>

        {/* Card 3: Users */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl glass flex items-center space-x-4">
          <div className="p-3 bg-emerald-600/15 rounded-xl border border-emerald-500/20">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">
              {isGlobalAdmin ? 'Total Users' : 'Unique Attendees'}
            </p>
            <p className="text-3xl font-black text-slate-100 mt-1">{stats.totalUsers || 0}</p>
          </div>
        </div>
      </div>

      {/* Analytics Widgets Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Breakdown (2/3 width on desktop) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/30 p-6 glass flex flex-col space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <span>Category Registration Spread</span>
          </h2>
          <p className="text-xs text-slate-400">Total registered slots compared across different categories</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {Object.entries(categoryStats).map(([catName, value]) => {
              const bgStyles = {
                Technical: 'from-indigo-600 to-indigo-500 shadow-indigo-600/15 border-indigo-500/20',
                Cultural: 'from-pink-600 to-pink-500 shadow-pink-600/15 border-pink-500/20',
                Sports: 'from-emerald-600 to-emerald-500 shadow-emerald-600/15 border-emerald-500/20',
              };
              return (
                <div key={catName} className="p-4 rounded-xl bg-slate-950/40 border border-slate-850 flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-400">{catName}</span>
                  <div className="flex items-baseline space-x-1.5 mt-3">
                    <span className="text-2xl font-black text-slate-100">{value}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">tickets</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role Breakdown / Details Panel */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 glass flex flex-col space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>{isGlobalAdmin ? 'Role Breakdown' : 'Staff Settings'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {isGlobalAdmin ? 'Registered users sorted by platform roles' : 'Logged-in user profile details'}
          </p>

          <div className="space-y-3 pt-2">
            {isGlobalAdmin ? (
              Object.entries(roleBreakdown).map(([roleName, count]) => (
                <div key={roleName} className="flex justify-between items-center bg-slate-950/30 p-2.5 rounded-xl border border-slate-850/60">
                  <span className="text-sm font-semibold text-slate-350">{roleName.replace('_', ' ')}s</span>
                  <span className="text-xs font-extrabold bg-slate-800 text-indigo-400 border border-slate-700 px-2.5 py-1 rounded-lg">
                    {count}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-300 space-y-2 p-3 bg-slate-950/30 rounded-xl border border-slate-850/60">
                <p><span className="font-semibold text-slate-450">Name:</span> {user?.name}</p>
                <p><span className="font-semibold text-slate-450">Email:</span> {user?.email}</p>
                <p><span className="font-semibold text-slate-450">Role:</span> Club Organizer</p>
                <p className="text-[10px] text-indigo-400 italic pt-1">You have access to create events and track attendance for events hosted by your account.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Managed Events List Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/20 shadow-xl overflow-hidden glass">
        
        {/* Table Header toolbar */}
        <div className="p-6 border-b border-slate-850 bg-slate-950/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <ListOrdered className="w-5.5 h-5.5 text-indigo-400" />
            <span>Managed Events</span>
          </h2>
        </div>

        {/* Table Data Container */}
        {eventBreakdown.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3">
            <Calendar className="w-12 h-12 text-slate-700" />
            <p className="text-sm text-slate-400 font-semibold">You have not created any events yet.</p>
            <p className="text-xs text-slate-500">Host your first event using the button in the top right.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-850 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Event Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Schedule</th>
                  <th className="p-4">Registrants (Capacity)</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/80">
                {eventBreakdown.map((item) => {
                  const itemDate = new Date(item.date);
                  const isClosed = itemDate < new Date();

                  return (
                    <tr key={item._id} className="hover:bg-slate-850/10 transition-colors">
                      {/* Title & Venue */}
                      <td className="p-4">
                        <p className="font-bold text-slate-200 line-clamp-1">{item.title}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-pink-400 flex-shrink-0" />
                          <span className="line-clamp-1">{item.venue}</span>
                        </p>
                      </td>

                      {/* Category Badge */}
                      <td className="p-4">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                            item.category === 'Technical'
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25'
                              : item.category === 'Cultural'
                              ? 'bg-pink-500/10 text-pink-400 border-pink-500/25'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          }`}
                        >
                          {item.category}
                        </span>
                      </td>

                      {/* Schedule */}
                      <td className="p-4">
                        <p className="text-slate-300 font-medium">
                          {itemDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center">
                          <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span>{itemDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                      </td>

                      {/* Registrants / Capacity */}
                      <td className="p-4 space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-300">
                          <span>{item.registeredCount} / {item.maxCapacity}</span>
                          <span className={item.capacityPercentage >= 100 ? 'text-rose-450' : 'text-indigo-400'}>
                            {item.capacityPercentage}%
                          </span>
                        </div>
                        <div className="w-32 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.capacityPercentage >= 100 ? 'bg-rose-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${Math.min(item.capacityPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </td>

                      {/* Table row actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Track Registrations */}
                          <button
                            onClick={() => setActiveEventForTracker(item)}
                            className="p-2 rounded-lg bg-slate-800 text-indigo-400 hover:text-indigo-300 hover:bg-slate-750 transition-colors border border-slate-750"
                            title="Track Participants"
                          >
                            <Users className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-2 rounded-lg bg-slate-800 text-amber-400 hover:text-amber-350 hover:bg-slate-750 transition-colors border border-slate-750"
                            title="Edit Event"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteEvent(item._id, item.title)}
                            className="p-2 rounded-lg bg-slate-800 text-rose-400 hover:text-rose-350 hover:bg-slate-750 transition-colors border border-slate-750"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit event modal Overlay */}
      {isEventModalOpen && (
        <EventModal
          event={activeEventForEdit}
          onClose={handleCloseEventModal}
          onSaveSuccess={handleSaveSuccess}
        />
      )}

      {/* Track participants modal Overlay */}
      {activeEventForTracker && (
        <ParticipantTrackerModal
          event={activeEventForTracker}
          onClose={() => setActiveEventForTracker(null)}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
