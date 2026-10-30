import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  BookOpen,
  Bus,
  BedDouble,
  Boxes,
  Clock,
  Plus,
  CheckCircle2,
  X,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

export const OperationsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'library' | 'transport' | 'hostels' | 'inventory' | 'timetable'>('library');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Issue Book Modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [studentAdmission, setStudentAdmission] = useState('MWK/2026/0142');
  const [message, setMessage] = useState<string | null>(null);

  const fetchOperations = async () => {
    setLoading(true);
    try {
      const res = await api.getOperationsData();
      setData(res);
      if (res.libraryBooks?.length > 0 && !selectedBookId) {
        setSelectedBookId(res.libraryBooks[0].id);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, []);

  const handleIssueBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Find student by admission number
      const students = await api.getStudents({ search: studentAdmission });
      if (!students || students.length === 0) {
        alert('Student not found with this admission number');
        return;
      }
      await api.borrowBook({
        book_id: selectedBookId,
        student_id: students[0].id,
        due_days: 14,
      });
      setMessage('Book copy issued to pupil successfully.');
      setShowIssueModal(false);
      fetchOperations();
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Issue failed');
    }
  };

  const handleReturnBook = async (issueId: string) => {
    try {
      await api.returnBook(issueId);
      setMessage('Book returned and stock copy restored.');
      fetchOperations();
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Return failed');
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
          <button onClick={() => setMessage(null)} className="text-emerald-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Operations Navigation Subtabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveSubTab('library')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === 'library' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Library Catalogue</span>
          </button>
          <button
            onClick={() => setActiveSubTab('transport')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === 'transport' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bus className="w-3.5 h-3.5 text-amber-600" />
            <span>School Transport</span>
          </button>
          <button
            onClick={() => setActiveSubTab('hostels')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === 'hostels' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BedDouble className="w-3.5 h-3.5 text-purple-600" />
            <span>Boarding & Hostels</span>
          </button>
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === 'inventory' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-emerald-600" />
            <span>Store & Inventory</span>
          </button>
          <button
            onClick={() => setActiveSubTab('timetable')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === 'timetable' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-slate-700" />
            <span>Timetable Schedule</span>
          </button>
        </div>

        {activeSubTab === 'library' && (
          <button
            onClick={() => setShowIssueModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Book to Pupil</span>
          </button>
        )}
      </div>

      {/* Subtab Contents */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading operations records...</div>
        ) : activeSubTab === 'library' ? (
          /* LIBRARY MODULE */
          <div className="divide-y divide-slate-200">
            {/* Books Catalogue */}
            <div className="p-5">
              <h4 className="text-sm font-bold text-slate-900 mb-3">Textbooks & Readers Catalogue</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Title & Edition</th>
                      <th className="py-2.5 px-3">Author / Publisher</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-center">Available / Total</th>
                      <th className="py-2.5 px-3">Shelf</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {data?.libraryBooks?.map((b: any) => (
                      <tr key={b.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{b.title}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-600">{b.author}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-600">{b.category}</td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          <span className={b.available_copies > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                            {b.available_copies}
                          </span>{' '}
                          / {b.total_copies}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-500">{b.shelf_location || 'General'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active Issues / Circulation */}
            <div className="p-5">
              <h4 className="text-sm font-bold text-slate-900 mb-3">Circulation & Borrowing Records</h4>
              {data?.libraryIssues?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No books currently borrowed.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Book Title</th>
                        <th className="py-2.5 px-3">Borrower Pupil</th>
                        <th className="py-2.5 px-3">Issued Date</th>
                        <th className="py-2.5 px-3">Due Date</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data?.libraryIssues?.map((iss: any) => (
                        <tr key={iss.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-medium text-slate-900">{iss.book_title}</td>
                          <td className="py-2.5 px-3 text-slate-800">
                            {iss.first_name} {iss.last_name} ({iss.admission_number})
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{iss.issued_date}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{iss.due_date}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                                iss.status === 'Returned'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {iss.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {iss.status === 'Borrowed' && (
                              <button
                                onClick={() => handleReturnBook(iss.id)}
                                className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded text-xs font-semibold"
                              >
                                Return Book
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : activeSubTab === 'transport' ? (
          /* TRANSPORT MODULE */
          <div className="p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Mwanaweika School Bus Fleet & Routes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.transportRoutes?.map((rt: any) => (
                <div key={rt.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-sm text-slate-900">{rt.route_name}</h5>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-mono font-bold rounded">
                      {rt.vehicle_reg}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Pickup Stages:</span> {rt.pickup_points}
                  </p>
                  <div className="pt-2 border-t border-slate-200 text-xs flex items-center justify-between text-slate-500">
                    <span>Driver: {rt.driver_name} ({rt.driver_phone})</span>
                    <span className="font-mono font-semibold text-blue-900">
                      Fare: UGX {Number(rt.fee_amount).toLocaleString()} / Term
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeSubTab === 'hostels' ? (
          /* HOSTELS / DORMITORIES */
          <div className="p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Boarding Hostels & Dormitory Blocks</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.hostels?.map((h: any) => (
                <div key={h.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-sm text-slate-900">{h.name}</h5>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[11px] font-semibold rounded">
                      {h.gender} Hostel
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Warden / Matron: <span className="font-semibold text-slate-800">{h.warden_name}</span> ({h.warden_phone})
                  </p>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Occupancy: {h.occupied_beds || 1} / {h.capacity} beds</span>
                    <span className="text-emerald-700 font-bold">
                      {h.capacity - (h.occupied_beds || 1)} Vacant Beds
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeSubTab === 'inventory' ? (
          /* INVENTORY / STORE */
          <div className="p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Consumables & Institutional Store Stock</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Item Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-center">Unit</th>
                    <th className="py-2.5 px-3 text-right">In Stock</th>
                    <th className="py-2.5 px-3 text-right">Reorder Threshold</th>
                    <th className="py-2.5 px-3 text-right">Unit Cost (UGX)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {data?.inventoryItems?.map((i: any) => (
                    <tr key={i.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{i.name}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600">{i.category}</td>
                      <td className="py-2.5 px-3 text-center font-sans text-slate-600">{i.unit}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{i.quantity}</td>
                      <td className="py-2.5 px-3 text-right text-slate-500">{i.reorder_level}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{Number(i.unit_cost).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* TIMETABLE SCHEDULE */
          <div className="p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Master Class Teaching Timetable</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Day of Week</th>
                    <th className="py-2.5 px-3">Time Slot</th>
                    <th className="py-2.5 px-3">Class & Stream</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Teacher</th>
                    <th className="py-2.5 px-3">Location / Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.timetableSlots?.map((tt: any) => (
                    <tr key={tt.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{tt.day_of_week}</td>
                      <td className="py-2.5 px-3 font-mono font-medium text-blue-900">{tt.start_time} - {tt.end_time}</td>
                      <td className="py-2.5 px-3 text-slate-700">{tt.class_name}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{tt.subject_name}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {tt.teacher_first ? `${tt.teacher_first} ${tt.teacher_last}` : 'Assigned Teacher'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{tt.room_name || 'Standard Classroom'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Issue Book Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Issue Textbook to Pupil</h3>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIssueBookSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Book *</label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  {data?.libraryBooks?.map((b: any) => (
                    <option key={b.id} value={b.id} disabled={b.available_copies <= 0}>
                      {b.title} ({b.available_copies} available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Pupil Admission Number *</label>
                <input
                  type="text"
                  required
                  value={studentAdmission}
                  onChange={(e) => setStudentAdmission(e.target.value)}
                  placeholder="e.g. MWK/2026/0142"
                  className="w-full px-3 py-2 font-mono border rounded-lg"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border rounded-lg font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold shadow-sm"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
