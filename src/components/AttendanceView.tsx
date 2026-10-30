import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { SchoolClass } from '../types';
import {
  CalendarCheck,
  Check,
  X,
  Clock,
  HelpCircle,
  Save,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface AttendanceViewProps {
  classes: SchoolClass[];
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ classes }) => {
  const [selectedClass, setSelectedClass] = useState('cls-p7');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: string; reason?: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchClassRegister = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await api.getAttendance({ class_id: selectedClass, date });
      setStudents(data.students || []);

      // Populate local state
      const initialMap: Record<string, { status: string; reason?: string }> = {};
      (data.students || []).forEach((st: any) => {
        initialMap[st.student_id] = {
          status: st.status || 'Present',
          reason: st.reason || '',
        };
      });
      setAttendanceMap(initialMap);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassRegister();
  }, [selectedClass, date]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        reason,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: string; reason?: string }> = {};
    students.forEach((s) => {
      updated[s.student_id] = { status: 'Present', reason: '' };
    });
    setAttendanceMap(updated);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const records = Object.keys(attendanceMap).map((id) => ({
        student_id: id,
        status: attendanceMap[id].status,
        reason: attendanceMap[id].reason,
      }));

      await api.submitAttendance({
        class_id: selectedClass,
        date,
        records,
      });

      setMessage('Class attendance register saved successfully to the database.');
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter((a) => a.status === 'Present').length;
  const absentCount = Object.values(attendanceMap).filter((a) => a.status === 'Absent').length;
  const lateCount = Object.values(attendanceMap).filter((a) => a.status === 'Late').length;
  const excusedCount = Object.values(attendanceMap).filter((a) => a.status === 'Excused').length;
  const total = students.length;
  const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Banner Message */}
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Class Attendance Registers</h3>
            <p className="text-xs text-slate-500">
              Daily morning roll call register with auditable absence tracking and reason records.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllPresent}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Mark All Present
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || students.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Register...' : 'Save Register'}</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Class Level</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Attendance Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Session</label>
            <div className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-600 font-medium">
              Morning Roll Call (08:00 AM)
            </div>
          </div>
        </div>

        {/* Live Attendance Rate Summary */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-emerald-700 font-bold">Present: {presentCount}</span>
            <span className="text-rose-700 font-bold">Absent: {absentCount}</span>
            <span className="text-amber-700 font-bold">Late: {lateCount}</span>
            <span className="text-blue-700 font-bold">Excused: {excusedCount}</span>
          </div>
          <div className="font-sans font-bold text-slate-900">
            Attendance Rate: <span className="text-blue-700 font-mono">{rate}%</span>
          </div>
        </div>
      </div>

      {/* Class Register Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading register...</div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No pupils currently enrolled in this class.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Learner Name</th>
                  <th className="py-3 px-4">Admission No.</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Absence / Lateness Reason (Optional)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => {
                  const currentStatus = attendanceMap[st.student_id]?.status || 'Present';
                  const currentReason = attendanceMap[st.student_id]?.reason || '';

                  return (
                    <tr key={st.student_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {st.first_name} {st.last_name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {st.admission_number}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.student_id, 'Present')}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.student_id, 'Late')}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                              currentStatus === 'Late'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.student_id, 'Absent')}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.student_id, 'Excused')}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                              currentStatus === 'Excused'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Leave
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder={currentStatus !== 'Present' ? 'Specify reason for record...' : 'None'}
                          value={currentReason}
                          onChange={(e) => handleReasonChange(st.student_id, e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
