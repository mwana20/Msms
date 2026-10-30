import React, { useState } from 'react';
import { User } from '../types';
import {
  GraduationCap,
  CalendarCheck,
  BookOpen,
  Clock,
  ShieldCheck,
  Megaphone,
  UserCheck,
  FileText,
  Award,
  Download
} from 'lucide-react';

interface StudentPortalViewProps {
  currentUser: User;
  onOpenReportCard: (studentId: string) => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  currentUser,
  onOpenReportCard,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timetable' | 'academics'>('overview');

  // Brian Kato's S.3 Blue Timetable
  const timetable = [
    { day: 'Monday', slots: [
      { time: '08:00 - 09:20', subject: 'Mathematics', teacher: 'Mr. Emmanuel Byamukama', room: 'Block C - Rm 4' },
      { time: '09:40 - 11:00', subject: 'Physics (Theory)', teacher: 'Mr. Emmanuel Byamukama', room: 'Science Lab 2' },
      { time: '11:30 - 12:50', subject: 'English Language', teacher: 'Mrs. Stella Nalubega', room: 'Block C - Rm 4' },
      { time: '14:00 - 15:20', subject: 'Chemistry', teacher: 'Mr. D. Omondi', room: 'Lab 1' },
    ]},
    { day: 'Tuesday', slots: [
      { time: '08:00 - 09:20', subject: 'Biology', teacher: 'Ms. R. Akello', room: 'Bio Lab' },
      { time: '09:40 - 11:00', subject: 'Geography', teacher: 'Mr. P. Mukisa', room: 'Block C - Rm 4' },
      { time: '11:30 - 12:50', subject: 'Mathematics Tutorial', teacher: 'Mr. Emmanuel Byamukama', room: 'Block C - Rm 4' },
      { time: '14:00 - 16:00', subject: 'Physics Practical Lab', teacher: 'Mr. Emmanuel Byamukama', room: 'Physics Lab' },
    ]},
    { day: 'Wednesday', slots: [
      { time: '08:00 - 09:20', subject: 'History & Political Ed', teacher: 'Mr. J. Katende', room: 'Block C - Rm 4' },
      { time: '09:40 - 11:00', subject: 'English Literature', teacher: 'Mrs. S. Nalubega', room: 'Library Annex' },
      { time: '11:30 - 12:50', subject: 'Chemistry Practicals', teacher: 'Mr. D. Omondi', room: 'Chem Lab' },
      { time: '14:30 - 16:30', subject: 'Co-curricular & Sports', teacher: 'Coach Kasozi', room: 'Main Sports Pitch' },
    ]},
    { day: 'Thursday', slots: [
      { time: '08:00 - 09:20', subject: 'Physics (Mechanics)', teacher: 'Mr. Emmanuel Byamukama', room: 'Block C - Rm 4' },
      { time: '09:40 - 11:00', subject: 'Mathematics (Calculus)', teacher: 'Mr. Emmanuel Byamukama', room: 'Block C - Rm 4' },
      { time: '11:30 - 12:50', subject: 'Computer Studies', teacher: 'Mr. S. Mugisha', room: 'ICT Lab 1' },
      { time: '14:00 - 15:20', subject: 'Christian Religious Ed', teacher: 'Sr. Florence Namutebi', room: 'Block C - Rm 4' },
    ]},
    { day: 'Friday', slots: [
      { time: '08:00 - 09:20', subject: 'Biology Practicals', teacher: 'Ms. R. Akello', room: 'Bio Lab' },
      { time: '09:40 - 11:00', subject: 'General Science Seminar', teacher: 'Dept Faculty', room: 'Main Hall' },
      { time: '11:30 - 12:50', subject: 'Class Teacher Hour', teacher: 'Ms. Rebecca Akello', room: 'S.3 Blue' },
      { time: '14:00 - 16:00', subject: 'Clubs & Societies', teacher: 'Club Patrons', room: 'Campus Grounds' },
    ]},
  ];

  const grades = [
    { code: 'MTH 301', title: 'Mathematics', score: 86, grade: 'D1', descriptor: 'Distinction 1', teacher: 'Mr. Emmanuel Byamukama' },
    { code: 'PHY 302', title: 'Physics', score: 82, grade: 'D1', descriptor: 'Distinction 1', teacher: 'Mr. Emmanuel Byamukama' },
    { code: 'CHM 303', title: 'Chemistry', score: 79, grade: 'D2', descriptor: 'Distinction 2', teacher: 'Mr. D. Omondi' },
    { code: 'BIO 304', title: 'Biology', score: 81, grade: 'D1', descriptor: 'Distinction 1', teacher: 'Ms. Rebecca Akello' },
    { code: 'ENG 305', title: 'English Language', score: 78, grade: 'D2', descriptor: 'Distinction 2', teacher: 'Mrs. Stella Nalubega' },
    { code: 'GEO 306', title: 'Geography', score: 75, grade: 'C3', descriptor: 'Credit 3', teacher: 'Mr. P. Mukisa' },
    { code: 'HIS 307', title: 'History & Political Ed', score: 80, grade: 'D2', descriptor: 'Distinction 2', teacher: 'Mr. J. Katende' },
  ];

  return (
    <div className="space-y-6">
      {/* Student Welcome Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-800 text-[11px] font-semibold rounded-md border border-blue-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Learner Portal · Strict Isolation Active (Brian Kato Only)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Welcome, Brian Kato
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Adm No: MWK/2026/0146</span>
            <span aria-hidden="true">·</span>
            <span>Class: S.3 Blue</span>
            <span aria-hidden="true">·</span>
            <span>Boarder: Mandela Hall (Bed 14-B)</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-semibold">Active Enrollment</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenReportCard('std-brian')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Award className="w-4 h-4" />
            <span>Official Report Card</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Learner Overview & Attendance
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'timetable'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          S.3 Blue Timetable
        </button>
        <button
          onClick={() => setActiveTab('academics')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'academics'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Assessment Grades
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500">Term I Attendance</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">95.4%</span>
                <span className="text-xs text-emerald-600 font-medium">42/44 Days Present</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '95.4%' }}></div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500">Class Position</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">3rd</span>
                <span className="text-xs text-slate-500">Out of 48 Students</span>
              </div>
              <p className="mt-2 text-[11px] text-blue-700 font-medium">Division 1 (Distinction)</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500">Class Teacher</span>
              <div className="mt-1">
                <span className="text-base font-bold text-slate-900">Ms. Rebecca Akello</span>
                <p className="text-xs text-slate-500">Biology & S.3 Blue Head</p>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">Classroom: Block C - Rm 4</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500">Registered Guardian</span>
              <div className="mt-1">
                <span className="text-base font-bold text-slate-900">Mrs. Sarah Namubiru</span>
                <p className="text-xs text-slate-500">+256 772 443 219 (Mother)</p>
              </div>
              <p className="mt-2 text-[11px] text-emerald-700 font-semibold">Fees Fully Cleared (UGX 0 Bal)</p>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-700" />
                <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                  Term I Mid-Term Examination Results Published
                </h4>
              </div>
              <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
                Your official UNEB-format report card for Mid-Term 1 has been validated and released by Academic Registrar Dr. Anthony Mwesigwa and Head Teacher Dr. Phillip Mwanaweika.
              </p>
            </div>
            <button
              onClick={() => onOpenReportCard('std-brian')}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors"
            >
              View Report Card
            </button>
          </div>

          {/* Announcements for Students */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-500" />
              <span>Campus Announcements for S.3 Learners</span>
            </h3>
            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Inter-House Sports Competitions</span>
                  <span className="text-[11px] text-slate-400">November 14, 2026</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Kibuka House track athletes are requested to assemble at the sports field on Wednesday 4:00 PM for kit distribution.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Physics Practical Lab Safety Gear</span>
                  <span className="text-[11px] text-slate-400">November 08, 2026</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  All S.3 Physics students must bring their white lab coats for the upcoming optics and electricity practical assessment with Mr. Emmanuel Byamukama.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Timetable */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Senior Three Blue · Weekly Academic Timetable</h3>
                <p className="text-xs text-slate-500">Term I Academic Year 2026 · Class Teacher: Ms. Rebecca Akello</p>
              </div>
            </div>

            <div className="space-y-4">
              {timetable.map((dayItem) => (
                <div key={dayItem.day} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800">{dayItem.day}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                    {dayItem.slots.map((slot, idx) => (
                      <div key={idx} className="p-3 bg-white space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-blue-700 font-semibold">
                          <Clock className="w-3 h-3" />
                          <span>{slot.time}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-900">{slot.subject}</p>
                        <p className="text-[11px] text-slate-600">{slot.teacher}</p>
                        <p className="text-[10px] text-slate-400">{slot.room}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Academics */}
      {activeTab === 'academics' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Term I Continuous & Mid-Term Assessments</h3>
                <p className="text-xs text-slate-500">Standard UNEB Grading System (1-9 Scale)</p>
              </div>
              <button
                onClick={() => onOpenReportCard('std-brian')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg"
              >
                <Download className="w-3.5 h-3.5" />
                <span>View Full Report Card</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Subject Code</th>
                    <th className="py-2.5 px-3">Subject Name</th>
                    <th className="py-2.5 px-3">Subject Teacher</th>
                    <th className="py-2.5 px-3 text-right">Score</th>
                    <th className="py-2.5 px-3 text-center">UNEB Grade</th>
                    <th className="py-2.5 px-3">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {grades.map((g) => (
                    <tr key={g.code} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{g.code}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{g.title}</td>
                      <td className="py-2.5 px-3 text-slate-600">{g.teacher}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{g.score}%</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {g.grade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">{g.descriptor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
