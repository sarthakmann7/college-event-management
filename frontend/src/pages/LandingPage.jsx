import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Sparkles, Filter, ShieldAlert, RotateCcw } from 'lucide-react';
import EventCard from '../components/EventCard';
import SkeletonLoader from '../components/SkeletonLoader';
import EventDetailModal from '../components/EventDetailModal';
import { useAuth } from '../context/AuthContext';

const LandingPage = ({ onShowToast }) => {
  const { user } = useAuth();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  
  // Modals state
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 4000); // 400ms debounce
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch events list from backend
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/events', {
        params: {
          search: debouncedSearch,
          category: category !== 'All' ? category : undefined,
          status: status !== 'All' ? status : undefined,
        },
      });
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      setError('Could not retrieve campus events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, status]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle registration callback
  const handleRegisterSuccess = (msg) => {
    onShowToast(msg);
    setSelectedEvent(null);
    fetchEvents(); // Refresh event list (and user registrations)
  };

  const handleOpenDetails = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseDetails = () => {
    setSelectedEvent(null);
  };

  const categories = ['All', 'Technical', 'Cultural', 'Sports'];
  const statusOptions = [
    { value: 'All', label: 'All Dates' },
    { value: 'Live', label: 'Happening Today' },
    { value: 'Upcoming', label: 'Upcoming' },
    { value: 'Past', label: 'Past Events' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950/70 to-slate-950 border border-slate-800 p-8 md:p-12 shadow-2xl flex flex-col justify-center min-h-[260px]">
        <div className="absolute top-6 right-8 opacity-10 hidden md:block">
          <Sparkles className="w-48 h-48 text-indigo-400" />
        </div>
        <div className="max-w-2xl space-y-4">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
            University Event hub
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-100 tracking-tight leading-tight">
            Discover & Organize <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Campus Activities
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-400">
            Your centralized portal for technical hackathons, cultural festivals, and sports tournaments. Register instantly with your college ID.
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/30 p-5 rounded-2xl border border-slate-850 glass">
        
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, description or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filters Wrapper */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Category Chips */}
          <div className="flex items-center space-x-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-850">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  category === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Select */}
          <div className="flex items-center space-x-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-850">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-300 focus:outline-none cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center space-x-3 text-rose-400">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
          <button onClick={fetchEvents} className="ml-auto flex items-center space-x-1 text-xs underline font-bold hover:text-rose-350">
            <RotateCcw className="w-3 h-3" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonLoader key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl">
          <Search className="w-12 h-12 text-slate-700 mb-3" />
          <p className="text-lg font-bold text-slate-400">No events matched your search.</p>
          <p className="text-sm text-slate-500 mt-1">Try tweaking your search term, filters or category settings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const isRegistered = user?.registeredEvents?.some(
              (regEv) => (regEv._id || regEv) === event._id
            );
            return (
              <EventCard
                key={event._id}
                event={event}
                isRegistered={isRegistered}
                onOpenDetails={handleOpenDetails}
              />
            );
          })}
        </div>
      )}

      {/* Detail Modal overlay */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          user={user}
          isRegistered={user?.registeredEvents?.some(
            (regEv) => (regEv._id || regEv) === selectedEvent._id
          )}
          onClose={handleCloseDetails}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
    </div>
  );
};

export default LandingPage;
