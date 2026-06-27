import React, { useState, useEffect } from 'react';
import { X, Save, ShieldAlert, Sparkles } from 'lucide-react';
import axios from 'axios';

const EventModal = ({ event = null, onClose, onSaveSuccess }) => {
  const isEditMode = !!event;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    venue: '',
    date: '',
    registrationDeadline: '',
    maxCapacity: 50,
    bannerImageUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hydrate fields if editing
  useEffect(() => {
    if (event) {
      // Formats date string to 'yyyy-MM-ddThh:mm' which is required by `<input type="datetime-local">`
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        // Correct timezone shift for input
        const pad = (num) => String(num).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      setFormData({
        title: event.title || '',
        description: event.description || '',
        category: event.category || 'Technical',
        venue: event.venue || '',
        date: formatDate(event.date),
        registrationDeadline: formatDate(event.registrationDeadline),
        maxCapacity: event.maxCapacity || 50,
        bannerImageUrl: event.bannerImageUrl || '',
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxCapacity' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Pre-submit validation
    const eventTime = new Date(formData.date).getTime();
    const deadlineTime = new Date(formData.registrationDeadline).getTime();

    if (deadlineTime > eventTime) {
      setError('Registration deadline must be before or equal to the event date and time.');
      return;
    }

    setLoading(true);

    try {
      let res;
      if (isEditMode) {
        res = await axios.put(`/api/events/${event._id}`, formData);
      } else {
        res = await axios.post('/api/events', formData);
      }

      if (res.data.success) {
        onSaveSuccess(
          res.data.data,
          isEditMode ? 'Event updated successfully!' : 'Event created successfully!'
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-scale-up my-8 max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>{isEditMode ? 'Modify Campus Event' : 'Create Campus Event'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow p-6 space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. Annual Hackathon 2026"
              className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Grid Category & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Max Capacity (Seats) *
              </label>
              <input
                type="number"
                name="maxCapacity"
                value={formData.maxCapacity}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Event Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Provide event details, schedules, requirements, etc."
              className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Venue */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Venue / Location *
            </label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              required
              placeholder="e.g. Auditorium Hall B / Sports Complex"
              className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Grid Timings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Event Time */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Event Date & Time *
              </label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Registration Deadline *
              </label>
              <input
                type="datetime-local"
                name="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Banner URL */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Banner Image URL (Optional)
            </label>
            <input
              type="url"
              name="bannerImageUrl"
              value={formData.bannerImageUrl}
              onChange={handleChange}
              placeholder="Leave empty to use category default image"
              className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Errors */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center space-x-2.5 text-rose-400 text-xs">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800/80 bg-slate-950/40 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-850 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2 disabled:bg-indigo-700 disabled:cursor-wait"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Event'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
