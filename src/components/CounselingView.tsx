import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { User, CounselingSession } from '../types';
import { Heart, Plus, CheckCircle2, X, ShieldAlert, AlertTriangle } from 'lucide-react';

interface CounselingViewProps {
  currentUser: User;
}

export const CounselingView: React.FC<CounselingViewProps> = ({ currentUser }) => {
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    student_id: 'std-brian',
    session_topic: '',
    notes: '',
    action_plan: '',
    follow_up_required: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await api.getCounselingSessions();
      setSessions(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.recordCounselingSession(form);
      setMessage('Confidential guidance & counseling record saved.');
      setShowAddModal(false);
      setForm({
        student_id: 'std-brian',
        session_topic: '',
        notes: '',
        action_plan: '',
        follow_up_required: true,
      });
      fetchSessions();
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed recording counseling session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-emerald-600"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Control Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-50 text-purple-800 text-[11px] font-semibold rounded-md border border-purple-200 mb-1">
            <Heart className="w-3.5 h-3.5 text-purple-600" />
            <span>Privileged Psychological & Student Welfare Department</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">Student Counseling & Welfare Log</h3>
          <p className="text-xs text-slate-500">
            Managed by Rev. Sister Florence Namutebi. Strictly isolated from clinical and general faculty records.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Counseling Session</span>
        </button>
      </div>

      {/* Sessions Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-xl border">Loading confidential counseling cases...</div>
        ) : sessions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-xl border">No counseling records logged.</div>
        ) : (
          sessions.map((s: any) => (
            <div key={s.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{s.session_topic}</h4>
                  <p className="text-xs text-slate-500">
                    Student: <span className="font-semibold text-slate-800">{s.first_name} {s.last_name} ({s.admission_number})</span> · {s.class_name}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <span className="font-mono text-slate-400">{s.session_date}</span>
                  <span className="block text-[11px] text-purple-700 font-semibold">{s.counselor_name}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider mb-1">Session Notes:</span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {s.notes}
                </p>
              </div>

              {s.action_plan && (
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 block uppercase tracking-wider mb-1">Agreed Action Plan & Follow-up:</span>
                  <p className="text-xs text-emerald-900 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200">
                    {s.action_plan}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Record Confidential Counseling Consultation</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleRecordSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Student *</label>
                <select
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="std-brian">Brian Kato Mubiru (MWK/2026/0146 - S.3 Blue)</option>
                  <option value="std-joshua">Joshua Kigozi Mukasa (MWK/2026/0142 - P.7 Cranes)</option>
                  <option value="std-kevin">Kevin Joseph Wasswa (MWK/2026/0147 - S.3 Blue)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Session Topic / Consultation Focus *</label>
                <input
                  type="text"
                  required
                  value={form.session_topic}
                  onChange={(e) => setForm({ ...form, session_topic: e.target.value })}
                  placeholder="e.g. Exam anxiety, peer conflict resolution, study habits..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Confidential Counseling Observations & Notes *</label>
                <textarea
                  rows={3}
                  required
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Detailed notes of the student's situation and feelings..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Agreed Growth Plan / Support Steps</label>
                <textarea
                  rows={2}
                  value={form.action_plan}
                  onChange={(e) => setForm({ ...form, action_plan: e.target.value })}
                  placeholder="Specific interventions, routine adjustments..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Counseling Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
