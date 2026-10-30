import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { User, ClinicVisit } from '../types';
import { Stethoscope, Plus, CheckCircle2, X, AlertCircle, Phone, Calendar } from 'lucide-react';

interface HealthViewProps {
  currentUser: User;
}

export const HealthView: React.FC<HealthViewProps> = ({ currentUser }) => {
  const [visits, setVisits] = useState<ClinicVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    student_id: 'std-joshua',
    complaint: '',
    diagnosis: '',
    treatment: '',
    temperature_c: '36.8',
    parent_notified: false,
    admitted_to_sickbay: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await api.getHealthRecords();
      setVisits(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.recordClinicVisit(form);
      setMessage('Clinic consultation and prescription recorded.');
      setShowAddModal(false);
      setForm({
        student_id: 'std-joshua',
        complaint: '',
        diagnosis: '',
        treatment: '',
        temperature_c: '36.8',
        parent_notified: false,
        admitted_to_sickbay: false,
      });
      fetchRecords();
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed recording clinic visit');
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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-50 text-rose-800 text-[11px] font-semibold rounded-md border border-rose-200 mb-1">
            <Stethoscope className="w-3.5 h-3.5 text-rose-600" />
            <span>Restricted Medical Confidentiality · School Sickbay</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">Student Health & Clinic Logs</h3>
          <p className="text-xs text-slate-500">
            Managed by Nurse Juliet Nabirye. Authorized access only to certified medical and executive leadership staff.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Log Clinic Consultation</span>
        </button>
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading clinic records...</div>
        ) : visits.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No student clinical visits logged.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Learner</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Presenting Complaint</th>
                  <th className="py-3 px-4">Diagnosis & Treatment</th>
                  <th className="py-3 px-4 text-center">Temp (°C)</th>
                  <th className="py-3 px-4 text-center">Parent Notified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {visits.map((v: any) => (
                  <tr key={v.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono text-slate-500">{v.visit_date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {v.first_name} {v.last_name}
                      <span className="block font-mono text-[10px] text-slate-400">{v.admission_number}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{v.class_name}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{v.complaint}</td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      <span className="font-semibold text-slate-800">{v.diagnosis || 'Clinical evaluation'}:</span> {v.treatment}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{v.temperature_c || '36.6'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.parent_notified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {v.parent_notified ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Clinic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Record Sickbay Clinic Consultation</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleRecordSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Patient Pupil *</label>
                <select
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="std-joshua">Joshua Kigozi Mukasa (MWK/2026/0142 - P.7 Cranes)</option>
                  <option value="std-brian">Brian Kato Mubiru (MWK/2026/0146 - S.3 Blue)</option>
                  <option value="std-patricia">Patricia Babirye Nansubuga (MWK/2026/0143 - P.7 Cranes)</option>
                  <option value="std-kevin">Kevin Joseph Wasswa (MWK/2026/0147 - S.3 Blue)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Presenting Symptoms / Complaint *</label>
                <input
                  type="text"
                  required
                  value={form.complaint}
                  onChange={(e) => setForm({ ...form, complaint: e.target.value })}
                  placeholder="e.g. Cough, fever, asthma wheezing, stomach pain..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Diagnosis</label>
                <input
                  type="text"
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  placeholder="e.g. Acute tonsillitis, fatigue..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Prescription & Clinical Treatment *</label>
                <textarea
                  rows={2}
                  required
                  value={form.treatment}
                  onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                  placeholder="Dosage, medication administered, bed rest duration..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.temperature_c}
                    onChange={(e) => setForm({ ...form, temperature_c: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex flex-col justify-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.parent_notified}
                      onChange={(e) => setForm({ ...form, parent_notified: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-slate-700 font-medium">Notify Parent by Call</span>
                  </label>
                </div>
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
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Health Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
