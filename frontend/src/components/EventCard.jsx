import React from 'react';
import { Calendar, MapPin, Users, Tag } from 'lucide-react';

const EventCard = ({ event, onOpenDetails, isRegistered }) => {
  const {
    title,
    description,
    category,
    venue,
    date,
    maxCapacity,
    registeredParticipants = [],
    bannerImageUrl,
  } = event;

  const eventDate = new Date(date);
  const isPast = eventDate < new Date();
  const slotsLeft = maxCapacity - registeredParticipants.length;
  const isFull = slotsLeft <= 0;

  // Category specific styles
  const categoryColors = {
    Technical: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Cultural: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    Sports: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Default banner images based on category
  const defaultBanner = {
    Technical: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=60',
    Cultural: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=60',
    Sports: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=60',
  };

  const imageSrc = bannerImageUrl || defaultBanner[category] || defaultBanner.Technical;

  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700 transition-all duration-300 shadow-xl flex flex-col h-full overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/5">
      {/* Banner image wrapper */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

        {/* Category Pill */}
        <span className={`absolute top-4 left-4 text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md ${categoryColors[category] || categoryColors.Technical}`}>
          {category}
        </span>

        {/* Status badges */}
        <div className="absolute top-4 right-4 flex flex-col space-y-1">
          {isRegistered && (
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-1 rounded-md bg-indigo-600/90 text-white border border-indigo-400/20 backdrop-blur-sm shadow-md">
              Registered
            </span>
          )}
          {isPast ? (
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-1 rounded-md bg-slate-800/90 text-slate-400 border border-slate-700/20 backdrop-blur-sm shadow-md">
              Past
            </span>
          ) : isFull ? (
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-1 rounded-md bg-rose-600/90 text-white border border-rose-400/20 backdrop-blur-sm shadow-md">
              Sold Out
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-1 rounded-md bg-emerald-600/90 text-white border border-emerald-400/20 backdrop-blur-sm shadow-md">
              Open
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
          {title}
        </h3>
        <p className="text-sm text-slate-400 mt-2 line-clamp-2 flex-grow">
          {description}
        </p>

        {/* Meta details list */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-pink-400 flex-shrink-0" />
            <span className="line-clamp-1">{venue}</span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Users className="w-4.5 h-4.5 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-200">
              {registeredParticipants.length}
            </span>
            <span className="text-xs text-slate-400">/ {maxCapacity}</span>
          </div>

          <button
            onClick={() => onOpenDetails(event)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all duration-300 ${
              isRegistered
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800 hover:bg-indigo-900'
                : isPast
                ? 'bg-slate-800 text-slate-400 hover:bg-slate-750 cursor-pointer'
                : isFull
                ? 'bg-rose-950 text-rose-300 border border-rose-900 hover:bg-rose-900'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/10 hover:shadow-indigo-500/20'
            }`}
          >
            {isRegistered ? 'View Ticket' : 'Learn More'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
