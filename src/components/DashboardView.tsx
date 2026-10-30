import React from 'react';
import {
  Users,
  CalendarCheck,
  CreditCard,
  Briefcase,
  BookOpen,
  Boxes,
  Stethoscope,
  Heart,
  TrendingUp,
  AlertTriangle,
  Megaphone,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Receipt,
  Bus,
  BedDouble,
  UserCheck
} from 'lucide-react';
import { User } from '../types';

interface DashboardViewProps {
  summary: any;
  currentUser: User;
  onNavigate: (tab: string) => void;
  onOpenTests?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  currentUser,
  onNavigate,
  onOpenTests,
}) => {
  const role = currentUser.role;

  const metrics = summary?.metrics || {
    totalStudents: 6,
    totalStaff: 15,
    presentToday: 5,
    absentToday: 1,
    attendanceRate: 83,
    feesCollected: 1750000,
    feesPending: 900000,
    recentExpenses: 3050000,
    borrowedBooks: 0,
    transportCount: 0,
    boardersCount: 3,
    clinicVisitsToday: 1,
    counselingSessionsCount: 1,
    stockItemsCount: 3,
  };

  const activeAnnouncements = summary?.activeAnnouncements || [];
  const recentPayments = summary?.recentPayments || [];
  const classEnrollments = summary?.classEnrollments || [];

  return (
    <div className="space-y-6">
      {/* Personalized Role Banner with Campus Photo */}
      <div className="relative rounded-xl overflow-hidden shadow-xs border border-slate-200">
        <img
          src="/src/assets/images/campus_grounds_photo_1793336331985.jpg"
          alt="Mwanaweika School Campus"
          className="w-full h-40 sm:h-44 object-cover object-center brightness-90"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-300 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>ROLE-SPECIALIZED CONSOLE · {role.toUpperCase()}</span>
            {currentUser.assignedContext && (
              <span className="hidden sm:inline bg-white/10 px-2 py-0.5 rounded text-white">
                {currentUser.assignedContext}
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
            Welcome, {currentUser.fullName}
          </h2>
          <p className="text-xs text-slate-200 max-w-2xl mt-1 line-clamp-2">
            Mwanaweika School Management System is running live with UNEB grading, localized Ugandan curriculum, and backend-enforced permissions.
          </p>
        </div>
      </div>

      {/* =========================================================================
          ROLE-SPECIFIC DASHBOARD SECTIONS
          ========================================================================= */}

      {/* 1. SUPER ADMINISTRATOR & SCHOOL ADMINISTRATOR DASHBOARD */}
      {(role === 'Super Administrator' || role === 'School Administrator') && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-slate-500 block">Total Active Learners</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{metrics.totalStudents}</p>
              <p className="text-[11px] text-slate-400 mt-1">P.1–P.7 and S.1–S.4</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-slate-500 block">Teaching & Staff</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{metrics.totalStaff}</p>
              <p className="text-[11px] text-slate-400 mt-1">15 Certified Personnel</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-slate-500 block">Today's Attendance</span>
              <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">{metrics.attendanceRate}%</p>
              <p className="text-[11px] text-slate-400 mt-1">{metrics.presentToday} Present / {metrics.absentToday} Absent</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-slate-500 block">Fees Collected (Term I)</span>
              <p className="text-lg font-bold font-mono text-blue-900 mt-1">UGX {Number(metrics.feesCollected).toLocaleString()}</p>
              <p className="text-[11px] text-amber-700 mt-1 font-mono">Bal: UGX {Number(metrics.feesPending).toLocaleString()}</p>
            </div>
          </div>

          {/* Quick System Action Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigate('students')}
              className="p-3 bg-white hover:bg-slate-50 border rounded-xl text-left transition-all"
            >
              <Users className="w-4 h-4 text-blue-600 mb-1" />
              <p className="font-bold text-xs text-slate-900">Manage Students</p>
              <p className="text-[11px] text-slate-500">Admissions & LINs</p>
            </button>
            <button
              onClick={() => onNavigate('finance')}
              className="p-3 bg-white hover:bg-slate-50 border rounded-xl text-left transition-all"
            >
              <CreditCard className="w-4 h-4 text-emerald-600 mb-1" />
              <p className="font-bold text-xs text-slate-900">Accounts & Ledger</p>
              <p className="text-[11px] text-slate-500">Invoices & Receipts</p>
            </button>
            <button
              onClick={() => onNavigate('staff')}
              className="p-3 bg-white hover:bg-slate-50 border rounded-xl text-left transition-all"
            >
              <Briefcase className="w-4 h-4 text-purple-600 mb-1" />
              <p className="font-bold text-xs text-slate-900">Human Resources</p>
              <p className="text-[11px] text-slate-500">Staff & Attendance</p>
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="p-3 bg-white hover:bg-slate-50 border rounded-xl text-left transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-slate-700 mb-1" />
              <p className="font-bold text-xs text-slate-900">System Audit Trail</p>
              <p className="text-[11px] text-slate-500">Security event logs</p>
            </button>
          </div>
        </div>
      )}

      {/* 2. HEAD TEACHER & DEPUTY HEAD TEACHER DASHBOARD */}
      {(role === 'Head Teacher' || role === 'Deputy Head Teacher') && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-slate-500 block">Class Roll Call</span>
              <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">{metrics.attendanceRate}%</p>
              <p className="text-[11px] text-slate-500 mt-1">Supervised Daily Attendance</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-slate-500 block">Examinations & UNEB</span>
              <p className="text-2xl font-bold font-mono text-blue-900 mt-1">Term I MOT</p>
              <p className="text-[11px] text-slate-500 mt-1">Continuous & EOT Tests</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-slate-500 block">Teachers on Duty</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">15 / 15</p>
              <p className="text-[11px] text-slate-500 mt-1">Staff clock-in verified</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase text-slate-500 block">Sickbay Consultations</span>
              <p className="text-2xl font-bold font-mono text-rose-700 mt-1">{metrics.clinicVisitsToday}</p>
              <p className="text-[11px] text-slate-500 mt-1">Reported to school nurse</p>
            </div>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-blue-950">Academic Supervision & Reports</p>
              <p className="text-slate-600 mt-0.5">Review continuous assessment submissions, class registers, and teacher lesson coverage.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigate('academics')}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs"
              >
                Inspect Marksheets
              </button>
              <button
                onClick={() => onNavigate('attendance')}
                className="px-3 py-1.5 bg-white border border-slate-300 font-semibold rounded-lg text-slate-800"
              >
                Review Registers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. DIRECTOR DASHBOARD */}
      {role === 'Director' && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs">
            <p className="font-bold text-amber-950">Governance & Executive Financial Overview</p>
            <p className="text-amber-800 mt-0.5">
              Strategic high-level reporting for the Board of Governors. Individual confidential medical, counseling and personal employee records remain appropriately isolated.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold uppercase text-slate-500">Term I Tuition Collections</span>
              <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                UGX {Number(metrics.feesCollected).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-2">Active student fee realization</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold uppercase text-slate-500">Outstanding Arrears</span>
              <p className="text-2xl font-bold font-mono text-amber-700 mt-1">
                UGX {Number(metrics.feesPending).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-2">Collection follow-ups by Accounts</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold uppercase text-slate-500">Operational Disbursements</span>
              <p className="text-2xl font-bold font-mono text-rose-700 mt-1">
                UGX {Number(metrics.recentExpenses).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-2">Supplies, utilities & provisions</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. CLASS TEACHER DASHBOARD (Rebecca Akello S.3 Blue) */}
      {role === 'Class Teacher' && (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
            <div>
              <p className="font-bold text-emerald-950">Assigned Classroom: Senior Three Blue (S.3 Blue)</p>
              <p className="text-emerald-800 mt-0.5">Responsible for daily roll call register, pupil conduct, and progress reports.</p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-xs"
            >
              Mark S.3 Blue Register
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">Learners in S.3 Blue</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">2 Learners</p>
              <p className="text-[11px] text-slate-400 mt-1">Brian Kato & Kevin Wasswa</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">Today's Class Attendance</span>
              <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">100%</p>
              <p className="text-[11px] text-slate-400 mt-1">1 Present, 1 Late (Reported)</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">Terminal Report Status</span>
              <p className="text-2xl font-bold font-mono text-blue-900 mt-1">Published</p>
              <p className="text-[11px] text-slate-400 mt-1">Term I Progress Endorsed</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUBJECT TEACHER DASHBOARD (Emmanuel Byamukama - Physics & Math) */}
      {role === 'Subject Teacher' && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs flex items-center justify-between">
            <div>
              <p className="font-bold text-blue-950">Assigned Curriculum: Physics & Mathematics</p>
              <p className="text-blue-800 mt-0.5">Enter continuous assessments, practical scores and UNEB marks for assigned subjects.</p>
            </div>
            <button
              onClick={() => onNavigate('academics')}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs"
            >
              Enter Subject Marks
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase">Physics Department</span>
              <p className="text-xs text-slate-600">S.3 Blue Practical Labs & Mechanics syllabus coverage at 78%.</p>
              <div className="pt-2 border-t text-[11px] text-blue-700 font-semibold">Top score: 88% (D1)</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase">Mathematics Department</span>
              <p className="text-xs text-slate-600">Pure Mathematics & Statistics mid-term grading completed.</p>
              <div className="pt-2 border-t text-[11px] text-emerald-700 font-semibold">Top score: 92% (D1)</div>
            </div>
          </div>
        </div>
      )}

      {/* 6. BURSAR & CASHIER DASHBOARD */}
      {(role === 'Bursar' || role === 'Cashier') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">Total Fees Collected</span>
              <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                UGX {Number(metrics.feesCollected).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Receipted to date</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">Student Fee Defaulters</span>
              <p className="text-2xl font-bold font-mono text-amber-700 mt-1">
                UGX {Number(metrics.feesPending).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Pending student balances</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">Counter Role Privilege</span>
              <p className="text-base font-bold text-slate-900 mt-2">
                {role === 'Cashier' ? 'Payment Receipting Only' : 'Full Cashbook & Fee Structures'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {role === 'Cashier' ? 'Expense posting restricted' : 'Full Accounting Access'}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => onNavigate('finance')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-xs"
            >
              Open Fee Management & Receipts
            </button>
          </div>
        </div>
      )}

      {/* 7. SCHOOL NURSE DASHBOARD */}
      {role === 'School Nurse' && (
        <div className="space-y-6">
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-xs flex items-center justify-between">
            <div>
              <p className="font-bold text-rose-950">Mwanaweika School Clinic & Sickbay</p>
              <p className="text-rose-800 mt-0.5">Confidential clinical consultations, medication records, and emergency parents notifications.</p>
            </div>
            <button
              onClick={() => onNavigate('health')}
              className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-semibold rounded-lg shadow-xs"
            >
              Open Clinic Log
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">Today's Clinic Consultations</span>
              <p className="text-2xl font-bold font-mono text-rose-700 mt-1">{metrics.clinicVisitsToday}</p>
              <p className="text-[11px] text-slate-400 mt-1">Joshua Kigozi (Mild dust bronchospasm treated)</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">Sickbay Beds Status</span>
              <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">4 Available</p>
              <p className="text-[11px] text-slate-400 mt-1">Zero overnight emergency admissions</p>
            </div>
          </div>
        </div>
      )}

      {/* 8. COUNSELOR DASHBOARD */}
      {role === 'Counselor' && (
        <div className="space-y-6">
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-xs flex items-center justify-between">
            <div>
              <p className="font-bold text-purple-950">Guidance & Counseling Department</p>
              <p className="text-purple-800 mt-0.5">Rev. Sister Florence Namutebi. Privileged psychological welfare and confidential student guidance.</p>
            </div>
            <button
              onClick={() => onNavigate('counseling')}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg shadow-xs"
            >
              Open Counseling Notes
            </button>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500">Active Guidance Cases</span>
            <p className="text-2xl font-bold font-mono text-purple-900 mt-1">{metrics.counselingSessionsCount} Case</p>
            <p className="text-[11px] text-slate-400 mt-1">Brian Kato (O-Level science study habits & prep scheduling)</p>
          </div>
        </div>
      )}

      {/* 9. OPERATIONS: LIBRARIAN, TRANSPORT, STOREKEEPER, WARDEN */}
      {(role === 'Librarian' || role === 'Transport Officer' || role === 'Storekeeper' || role === 'Hostel Warden') && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">{currentUser.assignedContext || 'Operations Section'}</p>
              <p className="text-slate-600 mt-0.5">Dedicated institutional logistics, resources and facility controls.</p>
            </div>
            <button
              onClick={() => onNavigate('operations')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-xs"
            >
              Open Operations Module
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500">Library Titles</span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">3 Textbooks</p>
              <p className="text-[10px] text-slate-400">Physics, Math, Bio</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500">School Bus Fleet</span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">1 Route</p>
              <p className="text-[10px] text-slate-400">UAZ 418K Coaster</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500">Hostel Dormitories</span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">120 Beds</p>
              <p className="text-[10px] text-slate-400">Boys & Girls Blocks</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500">Store Consumables</span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">{metrics.stockItemsCount} Items</p>
              <p className="text-[10px] text-slate-400">Stationery & Lab</p>
            </div>
          </div>
        </div>
      )}

      {/* Class Enrollment Breakdown & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h4 className="text-sm font-bold text-slate-900">Enrolled Classes Overview</h4>
            <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">P.1–S.4</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="py-2 px-3">Class</th>
                  <th className="py-2 px-3">Code</th>
                  <th className="py-2 px-3 text-right">Students</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {classEnrollments.slice(0, 6).map((c: any) => (
                  <tr key={c.code} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-sans text-slate-900 font-medium">{c.name}</td>
                    <td className="py-2 px-3 text-slate-600">{c.code}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">{c.student_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notices */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900">Official Notices</h4>
            <span className="text-xs text-slate-400 font-mono">Mukono Campus</span>
          </div>

          {activeAnnouncements.map((a: any) => (
            <div key={a.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
              <span className="font-bold text-slate-900 block">{a.title}</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">{a.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
