import React, { useState, useEffect, useCallback } from 'react';
import { X, Users, Download, ShieldCheck, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const ParticipantTrackerModal = ({ event, onClose, onShowToast }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/events/${event._id}/participants`);
      if (res.data.success) {
        setParticipants(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load participant list.');
    } finally {
      setLoading(false);
    }
  }, [event._id]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const handleToggleAttendance = async (registrationId, currentStatus) => {
    setTogglingId(registrationId);
    const newStatus = currentStatus === 'Attended' ? 'Absent' : 'Attended';
    try {
      const res = await axios.put(`/api/events/${event._id}/attendance/${registrationId}`, {
        attendanceStatus: newStatus,
      });

      if (res.data.success) {
        setParticipants((prev) =>
          prev.map((reg) =>
            reg._id === registrationId ? { ...reg, attendanceStatus: newStatus } : reg
          )
        );
        onShowToast(`Attendance marked as ${newStatus} for ${res.data.data.user.name}`);
      }
    } catch (err) {
      onShowToast(err.response?.data?.message || 'Failed to update attendance.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleExportCSV = () => {
    if (participants.length === 0) return;

    // Header row
    const headers = ['Name', 'Email', 'Registration Date', 'Attendance Status'];
    const rows = participants.map((p) => [
      p.user?.name || 'N/A',
      p.user?.email || 'N/A',
      new Date(p.timestamp).toLocaleDateString(),
      p.attendanceStatus,
    ]);

    // Construct CSV content
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.map((val) => `"${val}"`).join(','))].join('\n');

    // Create download link element
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const fileSafeTitle = event.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.setAttribute('download', `${fileSafeTitle}_participants.csv`);
    document.body.appendChild(link);

    // Trigger click to download
    link.click();
    document.body.removeChild(link);
    onShowToast('CSV exported successfully');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-scale-up my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
              <Users className="w-5.5 h-5.5 text-indigo-400" />
              <span>Participant Tracker</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
              Event: <span className="text-indigo-400 font-semibold">{event.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto flex-grow p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-sm text-slate-400">Loading registrants...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center space-x-2.5 text-rose-400 text-sm">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : participants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3 border-2 border-dashed border-slate-800 rounded-2xl">
              <Users className="w-12 h-12 text-slate-700" />
              <p className="text-sm text-slate-400 font-medium">No students registered yet.</p>
              <p className="text-xs text-slate-500">Registrations will appear here when students sign up.</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Action Toolbar */}
              <div className="flex justify-between items-center bg-slate-950/20 p-3 rounded-xl border border-slate-850">
                <span className="text-xs font-semibold text-slate-400">
                  Total Registrants: <span className="text-slate-100">{participants.length}</span>
                </span>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-bold transition-all border border-slate-750 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-850 bg-slate-950/20">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-slate-850 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Student</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Date Registered</th>
                      <th className="p-4 text-center">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/80">
                    {participants.map((reg) => {
                      const isAttended = reg.attendanceStatus === 'Attended';
                      return (
                        <tr key={reg._id} className="hover:bg-slate-850/20 transition-colors">
                          <td className="p-4 flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 text-xs border border-slate-750">
                              {reg.user?.name ? reg.user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <span className="font-semibold text-slate-200">{reg.user?.name || 'Unknown Student'}</span>
                          </td>
                          <td className="p-4 text-slate-350">{reg.user?.email || 'N/A'}</td>
                          <td className="p-4 text-slate-400 text-xs">
                            {new Date(reg.timestamp).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleToggleAttendance(reg._id, reg.attendanceStatus)}
                              disabled={togglingId === reg._id}
                              className={`mx-auto flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                                isAttended
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                  : 'bg-slate-800 text-slate-400 border-slate-750 hover:bg-slate-750'
                              } disabled:opacity-50 disabled:cursor-wait`}
                            >
                              <CheckCircle className={`w-3.5 h-3.5 ${isAttended ? 'opacity-100' : 'opacity-40'}`} />
                              <span>{isAttended ? 'Attended' : 'Mark Attended'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800/80 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-850 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantTrackerModal;
