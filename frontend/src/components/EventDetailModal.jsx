import React, { useState } from 'react';
import { X, Calendar, MapPin, Users, Mail, User, Info, CalendarClock, Ticket, ShieldAlert } from 'lucide-react';
import axios from 'axios';

const EventDetailModal = ({ event, onClose, isRegistered, onRegisterSuccess, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    _id,
    title,
    description,
    category,
    venue,
    date,
    registrationDeadline,
    maxCapacity,
    registeredParticipants = [],
    organizer = {},
    bannerImageUrl,
  } = event;

  const eventDate = new Date(date);
  const deadlineDate = new Date(registrationDeadline);
  const isPastEvent = eventDate < new Date();
  const isPastDeadline = deadlineDate < new Date();
  const slotsLeft = maxCapacity - registeredParticipants.length;
  const isFull = slotsLeft <= 0;

  const formattedEventDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedDeadlineDate = deadlineDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate registration progress percentage
  const progressPercent = Math.min(
    Math.round((registeredParticipants.length / maxCapacity) * 100),
    100
  );

  const defaultBanner = {
    Technical: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60',
    Cultural: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60',
    Sports: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60',
  };

  const imageSrc = bannerImageUrl || defaultBanner[category] || defaultBanner.Technical;

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`/api/events/${_id}/register`);
      if (res.data.success) {
        onRegisterSuccess(res.data.message || 'Successfully registered!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Determine button state and text
  let buttonText = 'Register Now';
  let buttonDisabled = false;
  let buttonStyle = 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30';

  if (isRegistered) {
    buttonText = 'Registered (Admission Secured)';
    buttonDisabled = true;
    buttonStyle = 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed';
  } else if (isPastEvent) {
    buttonText = 'Event Has Ended';
    buttonDisabled = true;
    buttonStyle = 'bg-slate-800 text-slate-500 border border-slate-750 cursor-not-allowed';
  } else if (isPastDeadline) {
    buttonText = 'Registration Deadline Passed';
    buttonDisabled = true;
    buttonStyle = 'bg-slate-800 text-slate-500 border border-slate-750 cursor-not-allowed';
  } else if (isFull) {
    buttonText = 'Event Sold Out';
    buttonDisabled = true;
    buttonStyle = 'bg-rose-950 text-rose-400 border border-rose-900 cursor-not-allowed';
  } else if (loading) {
    buttonText = 'Registering...';
    buttonDisabled = true;
    buttonStyle = 'bg-indigo-700 text-indigo-300 cursor-wait';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-scale-up my-8 max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-950/90 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scroll Container */}
        <div className="overflow-y-auto flex-grow">
          {/* Cover Banner */}
          <div className="relative h-64 w-full bg-slate-950">
            <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-600 border border-indigo-400/30 text-white shadow-lg">
                {category}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-3 drop-shadow-md">
                {title}
              </h2>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 md:p-8 space-y-6">
            
            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <Info className="w-5 h-5 text-indigo-400" />
                <span>About the Event</span>
              </h3>
              <p className="text-sm md:text-base text-slate-350 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
              
              {/* Event Timing & Venue */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/40 border border-slate-850">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Date & Location</h4>
                <div className="space-y-2.5 text-sm text-slate-300">
                  <div className="flex items-start space-x-2">
                    <Calendar className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>{formattedEventDate}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                    <span>{venue}</span>
                  </div>
                </div>
              </div>

              {/* Deadlines & Capacity */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/40 border border-slate-850">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Deadlines & Seats</h4>
                <div className="space-y-2.5 text-sm text-slate-300">
                  <div className="flex items-start space-x-2">
                    <CalendarClock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className={isPastDeadline ? 'text-rose-400 line-through' : ''}>
                      Deadline: {formattedDeadlineDate}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Users className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>
                      {slotsLeft > 0 ? `${slotsLeft} of ${maxCapacity} seats available` : 'No seats left'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Registration Occupancy</span>
                <span className={isFull ? 'text-rose-400' : 'text-indigo-400'}>
                  {progressPercent}% Filled ({registeredParticipants.length}/{maxCapacity})
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFull ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Organizer Info Box */}
            <div className="p-4 rounded-2xl bg-indigo-950/10 border border-indigo-950/40 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center font-bold text-indigo-400">
                {organizer.name?.charAt(0).toUpperCase() || 'O'}
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Hosted By</p>
                <p className="text-sm font-semibold text-slate-200">{organizer.name || 'Club Organizer'}</p>
                <p className="text-xs text-slate-400 flex items-center mt-0.5">
                  <Mail className="w-3 h-3 mr-1" />
                  {organizer.email || 'organizer@college.edu'}
                </p>
              </div>
            </div>

            {/* Mock Ticket when registered */}
            {isRegistered && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900/30 to-violet-900/30 border border-indigo-500/20 flex flex-col space-y-3 relative overflow-hidden">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                  <Ticket className="w-32 h-32" />
                </div>
                <div className="flex items-center space-x-2 text-indigo-400">
                  <Ticket className="w-5 h-5" />
                  <span className="font-extrabold text-sm uppercase tracking-wider">Admission Ticket Secured</span>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p><span className="font-semibold text-slate-400">Attendee:</span> {user?.name}</p>
                  <p><span className="font-semibold text-slate-400">Ticket ID:</span> {`TKT-${_id.slice(-6).toUpperCase()}-${user?._id?.slice(-4).toUpperCase()}`}</p>
                  <p><span className="font-semibold text-slate-400">Instructions:</span> Please present your student ID card or this portal screen at the venue entrance.</p>
                </div>
              </div>
            )}

            {/* Error alerts */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center space-x-2.5 text-rose-400 text-xs">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer / Action Button */}
        <div className="p-6 border-t border-slate-800/80 bg-slate-950/40 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          {!buttonDisabled && (
            <button
              onClick={handleRegister}
              disabled={buttonDisabled}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all ${buttonStyle}`}
            >
              {buttonText}
            </button>
          )}
          {buttonDisabled && isRegistered && (
            <div className="px-5 py-2.5 text-xs text-indigo-400 font-bold bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center">
              Verified Registered Participant
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
