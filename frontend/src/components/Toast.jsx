import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center justify-between min-w-[320px] max-w-md p-4 rounded-xl shadow-2xl glass border border-slate-700 animate-slide-in">
      <div className="flex items-center space-x-3">
        {type === 'success' ? (
          <CheckCircle className="text-emerald-500 w-6 h-6 flex-shrink-0" />
        ) : (
          <AlertCircle className="text-rose-500 w-6 h-6 flex-shrink-0" />
        )}
        <p className="text-slate-100 text-sm font-medium leading-tight">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
