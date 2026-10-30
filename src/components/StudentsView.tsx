import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Student, SchoolClass } from '../types';
import {
  Users,
  Search,
  UserPlus,
  Filter,
  FileText,
  Eye,
  CheckCircle2,
  X,
  CreditCard,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';

interface StudentsViewProps {
  classes: SchoolClass[];
  onOpenReportCard: (studentId: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  classes,
  onOpenReportCard,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Active');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);

  // Admission form state
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: 'Male',
    dob: '2014-06-15',
    class_id: 'cls-p7',
    boarding_status: 'Day',
    lin: '',
    district: 'Mukono',
    address: 'Mukono Municipality',
    medical_notes: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    guardian_relationship: 'Parent',
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await api.getStudents({
        class_id: selectedClass || undefined,
        search: search || undefined,
        status: selectedStatus || undefined,
      });
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedClass, selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleViewDetails = async (id: string) => {
    try {
      const details = await api.getStudentDetails(id);
      setSelectedStudent(details);
    } catch (err: any) {
      alert(err.message || 'Failed to load details');
    }
  };

  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.admitStudent(formData);
      setNotification(`Learner admitted successfully! Admission Number: ${res.admission_number}`);
      setShowAdmissionModal(false);
      fetchStudents();
      // Reset form
      setFormData({
        first_name: '',
        middle_name: '',
        last_name: '',
        gender: 'Male',
        dob: '2014-06-15',
        class_id: 'cls-p7',
        boarding_status: 'Day',
        lin: '',
        district: 'Mukono',
        address: 'Mukono Municipality',
        medical_notes: '',
        guardian_name: '',
        guardian_phone: '',
        guardian_email: '',
        guardian_relationship: 'Parent',
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Admission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Notification */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Header & Filters */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Learners & Student Roster</h3>
            <p className="text-xs text-slate-500">
              Manage complete student profiles, Uganda Learner Identification Numbers (LIN), and verified guardian relations.
            </p>
          </div>
          <button
            onClick={() => setShowAdmissionModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Admit New Learner</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 pt-2 border-t border-slate-100">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by student name, admission number (e.g. MWK/2026/0142), or LIN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Search
            </button>
          </form>

          {/* Class Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="">All Classes (P.1–S.4)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="Active">Active</option>
              <option value="Graduated">Graduated</option>
              <option value="Transferred">Transferred</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading student registry...</div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No students found matching current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Admission No.</th>
                  <th className="py-3 px-4">Learner Name</th>
                  <th className="py-3 px-4">Class & Stream</th>
                  <th className="py-3 px-4">MoES LIN</th>
                  <th className="py-3 px-4">Boarding Status</th>
                  <th className="py-3 px-4 text-right">Fee Balance</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-blue-700">
                      {st.admission_number}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {st.first_name} {st.middle_name || ''} {st.last_name}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        DOB: {new Date(st.dob).toLocaleDateString()} · {st.gender}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {st.class_name} ({st.class_code})
                      {st.stream_name && (
                        <span className="block text-[11px] text-slate-500">{st.stream_name}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                      {st.lin || 'Pending LIN'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          st.boarding_status === 'Boarder'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {st.boarding_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      {st.outstanding_balance && st.outstanding_balance > 0 ? (
                        <span className="text-amber-700">
                          UGX {Number(st.outstanding_balance).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-emerald-700">Cleared</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleViewDetails(st.id)}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors"
                          title="View Profile & Guardians"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenReportCard(st.id)}
                          className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded transition-colors"
                          title="Print Terminal Report Card"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Profile Drawer / Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </h3>
                <p className="text-xs text-slate-300">
                  Admission No: <span className="font-mono text-emerald-300">{selectedStudent.admission_number}</span> · {selectedStudent.class_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Bio Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Uganda LIN</span>
                  <p className="font-mono font-medium text-slate-900 mt-0.5">{selectedStudent.lin || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Gender / DOB</span>
                  <p className="font-medium text-slate-900 mt-0.5">{selectedStudent.gender} · {selectedStudent.dob}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Boarding Status</span>
                  <p className="font-medium text-slate-900 mt-0.5">{selectedStudent.boarding_status}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Enrollment Date</span>
                  <p className="font-medium text-slate-900 mt-0.5">{selectedStudent.enrollment_date}</p>
                </div>
              </div>

              {/* Medical and Emergency Notes */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Restricted Health & Emergency Notes</h4>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
                  {selectedStudent.medical_notes || 'No specialized health conditions or allergies reported.'}
                </div>
              </div>

              {/* Guardian Relationships */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Verified Parents & Legal Guardians</h4>
                {selectedStudent.guardians && selectedStudent.guardians.length > 0 ? (
                  <div className="space-y-2">
                    {selectedStudent.guardians.map((g: any) => (
                      <div key={g.id} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{g.full_name} ({g.relationship})</p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {g.phone}</span>
                            {g.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {g.email}</span>}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded border border-emerald-200">
                          Verified Guardian
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No guardian records linked.</p>
                )}
              </div>

              {/* Financial Status */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Term I Invoices & Receipts</h4>
                <div className="space-y-2">
                  {selectedStudent.invoices?.map((inv: any) => (
                    <div key={inv.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{inv.invoice_number}</p>
                        <p className="text-[11px] text-slate-500">Due: {inv.due_date} · Status: {inv.status}</p>
                      </div>
                      <div className="text-right font-mono">
                        <p className="text-slate-900">Total: UGX {Number(inv.total_amount).toLocaleString()}</p>
                        <p className="text-amber-700 font-bold">Balance: UGX {Number(inv.balance).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => onOpenReportCard(selectedStudent.id)}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-sm"
              >
                Open Terminal Report Card
              </button>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Learner Admission Modal */}
      {showAdmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Student Admission & Enrollment</h3>
                <p className="text-xs text-slate-300">Register new learner for Mwanaweika School Mukono</p>
              </div>
              <button
                onClick={() => setShowAdmissionModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdmissionSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1">
                Learner Personal Biodata
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="e.g. Samuel"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={formData.middle_name}
                    onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="e.g. Ssozi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Last Name / Surname *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="e.g. Katende"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Learner ID (LIN)</label>
                  <input
                    type="text"
                    value={formData.lin}
                    onChange={(e) => setFormData({ ...formData, lin: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="e.g. LIN-UG-2026-XXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Class Level *</label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Boarding Status *</label>
                  <select
                    value={formData.boarding_status}
                    onChange={(e) => setFormData({ ...formData, boarding_status: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                  >
                    <option value="Day">Day Scholar</option>
                    <option value="Boarder">Boarding Resident</option>
                  </select>
                </div>
              </div>

              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1 pt-3">
                Guardian & Parent Contact
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Guardian Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.guardian_name}
                    onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="e.g. Mr. Gerald Mukasa"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Guardian Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.guardian_phone}
                    onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="e.g. +256 701 000 000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Medical / Health Notes</label>
                <textarea
                  rows={2}
                  value={formData.medical_notes}
                  onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="Allergies, chronic conditions, special dietary needs..."
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdmissionModal(false)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Enrolling...' : 'Confirm Enrollment & Generate Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
