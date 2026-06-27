import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Calendar, MapPin, Users, RefreshCw, ExternalLink } from 'lucide-react';
import EventDetailModal from '../components/EventDetailModal';
import { useAuth } from '../context/AuthContext';

const MyRegistrations = ({ onShowToast }) => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/registrations/my');
      if (res.data.success) {
        setRegistrations(res.data.data);
      }
    } catch (err) {
      setError('Failed to retrieve your event registrations. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleOpenTicket = (eventObj) => {
    setSelectedEvent(eventObj);
  };

  const handleCloseTicket = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Title */}
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
          <Ticket className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-100">My Admissions</h1>
          <p className="text-xs text-slate-400">Manage registrations, view tickets, and review schedules</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400">Loading your tickets...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm">
          {error}
        </div>
      ) : registrations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl">
          <Ticket className="w-12 h-12 text-slate-700 mb-3" />
          <p className="text-lg font-bold text-slate-400">No tickets found.</p>
          <p className="text-sm text-slate-500 mt-1">Explore upcoming events on the main calendar and secure your spot!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registrations.map((reg) => {
            const event = reg.event;
            if (!event) return null;

            const eventDate = new Date(event.date);
            const isPast = eventDate < new Date();

            const formattedDate = eventDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={reg._id}
                className={`relative rounded-2xl border ${
                  isPast ? 'border-slate-850 bg-slate-950/20' : 'border-slate-800 bg-slate-900/40 hover:border-slate-750 hover:bg-slate-900/60'
                } p-5 flex flex-col justify-between shadow-lg transition-all`}
              >
                {/* Header info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        event.category === 'Technical'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25'
                          : event.category === 'Cultural'
                          ? 'bg-pink-500/10 text-pink-400 border-pink-500/25'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                      }`}
                    >
                      {event.category}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isPast
                          ? 'bg-slate-800 text-slate-450 border border-slate-750'
                          : reg.attendanceStatus === 'Attended'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {isPast ? 'Closed' : reg.attendanceStatus === 'Attended' ? 'Attended' : 'Confirmed'}
                    </span>
                  </div>

                  <h3 className={`text-lg font-bold line-clamp-1 ${isPast ? 'text-slate-500' : 'text-slate-100'}`}>
                    {event.title}
                  </h3>

                  {/* Meta */}
                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                  </div>
                </div>

                {/* Footer details */}
                <div className="mt-5 pt-4 border-t border-slate-850/80 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Ticket ID</span>
                    <span className="text-xs font-mono font-semibold text-slate-300">
                      {`TKT-${event._id.slice(-4).toUpperCase()}-${user?._id?.slice(-4).toUpperCase()}`}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenTicket(event)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-bold transition-all border border-slate-750 shadow-sm"
                  >
                    <span>View Admission</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          user={user}
          isRegistered={true}
          onClose={handleCloseTicket}
          onRegisterSuccess={() => {}}
        />
      )}
    </div>
  );
};

export default MyRegistrations;
