import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, LogOut, LayoutDashboard, Ticket, GraduationCap } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <nav className="glass sticky top-0 z-40 border-b border-slate-850 px-4 py-3 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-indigo-400 font-extrabold text-xl tracking-tight">
          <GraduationCap className="w-8 h-8 text-indigo-500" />
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            CampusEvent
          </span>
        </Link>

        {/* Navigation Links */}
        {user && (
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/" className={navLinkClass('/')}>
              <Calendar className="w-4 h-4" />
              <span>Explore Events</span>
            </Link>

            {user.role === 'Student' && (
              <Link to="/my-registrations" className={navLinkClass('/my-registrations')}>
                <Ticket className="w-4 h-4" />
                <span>My Tickets</span>
              </Link>
            )}

            {(user.role === 'Admin' || user.role === 'Club_Organizer') && (
              <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Manage Portal</span>
              </Link>
            )}
          </div>
        )}

        {/* User Info & Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-100">{user.name}</span>
                <span className="text-xs text-indigo-400 font-medium px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 inline-block self-end">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center font-bold text-indigo-400 text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-400 p-2 rounded-xl hover:bg-slate-850 transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Links */}
      {user && (
        <div className="md:hidden flex items-center justify-around mt-3 pt-3 border-t border-slate-800">
          <Link to="/" className="text-xs flex flex-col items-center text-slate-400 hover:text-white">
            <Calendar className="w-5 h-5 mb-0.5" />
            <span>Events</span>
          </Link>

          {user.role === 'Student' && (
            <Link to="/my-registrations" className="text-xs flex flex-col items-center text-slate-400 hover:text-white">
              <Ticket className="w-5 h-5 mb-0.5" />
              <span>Tickets</span>
            </Link>
          )}

          {(user.role === 'Admin' || user.role === 'Club_Organizer') && (
            <Link to="/dashboard" className="text-xs flex flex-col items-center text-slate-400 hover:text-white">
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>Manage</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
