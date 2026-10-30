import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';

interface ReportCardModalProps {
  studentId: string;
  onClose: () => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  studentId,
  onClose,
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await api.getReportCard(studentId);
        setData(res);
      } catch (err: any) {
        alert(err.message || 'Failed to load report card');
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [studentId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8 flex flex-col">
        {/* Modal Controls Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold">Official Terminal Report Card</h3>
            <span className="text-xs text-slate-300">· Mwanaweika School Mukono</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Card Sheet */}
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Compiling report card...</div>
        ) : !data ? (
          <div className="p-16 text-center text-xs text-slate-500">Report data not available.</div>
        ) : (
          <div className="p-8 print-page bg-white text-slate-900 space-y-6">
            {/* School Letterhead & Crest */}
            <div className="border-b-2 border-slate-900 pb-4 text-center relative flex flex-col items-center">
              <img
                src="/src/assets/images/school_emblem_crest_1793336318439.jpg"
                alt="Mwanaweika School Crest"
                className="w-16 h-16 object-contain mb-2"
                referrerPolicy="no-referrer"
              />
              <h1 className="text-2xl font-black tracking-tight uppercase text-blue-950 font-serif">
                MWANAWEIKA SCHOOL - MUKONO
              </h1>
              <p className="text-xs font-semibold tracking-widest text-slate-700 italic">
                "{data.school.motto || 'Knowledge, Discipline & Integrity'}"
              </p>
              <p className="text-[11px] text-slate-600 mt-1">
                Plot 14 Kyaggwe Road, P.O. Box 244 Mukono, Uganda · Tel: {data.school.phone} · Email: {data.school.email}
              </p>
              <div className="mt-2 inline-block px-4 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded">
                PUPIL'S TERMINAL PROGRESS & COMPETENCY REPORT
              </div>
            </div>

            {/* Learner Biodata Table */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Learner's Name:</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {data.student.first_name} {data.student.middle_name || ''} {data.student.last_name}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Admission No:</span>
                <p className="font-mono font-bold text-blue-900 mt-0.5">{data.student.admission_number}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Class & Stream:</span>
                <p className="font-bold text-slate-900 mt-0.5">{data.student.class_name} {data.student.stream_name ? `(${data.student.stream_name})` : ''}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Term / Year:</span>
                <p className="font-bold text-slate-900 mt-0.5">{data.term} · {data.academicYear}</p>
              </div>
            </div>

            {/* Assessment Scores Table */}
            <div>
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-[10px] border-b border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-300">Subject</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">Max</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">Score</th>
                    <th className="py-2.5 px-2 text-center border-r border-slate-300">Grade</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Competency Descriptor (Uganda CBC)</th>
                    <th className="py-2.5 px-3">Subject Teacher's Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.subjectMarks.map((m: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 border-r border-slate-200">
                        {m.subject_name} ({m.subject_code})
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono border-r border-slate-200">{m.max_score}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-blue-900 border-r border-slate-200">{m.score}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-900 border-r border-slate-200">{m.grade}</td>
                      <td className="py-2.5 px-3 text-slate-700 border-r border-slate-200 text-[11px] leading-tight">{m.descriptor}</td>
                      <td className="py-2.5 px-3 text-slate-700 text-[11px] leading-tight italic">{m.teacher_comment || 'Satisfactory achievement.'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Overall Terminal Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Aggregate / Average:</span>
                <p className="font-mono font-bold text-base text-blue-950 mt-1">
                  {data.summary.average}% · Total: {data.summary.totalScore}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Overall Division:</span>
                <p className="font-bold text-emerald-800 text-sm mt-1">{data.summary.division}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Next Term Begins:</span>
                <p className="font-bold text-slate-900 text-sm mt-1">{data.summary.nextTermBegins}</p>
              </div>
            </div>

            {/* Remarks Section */}
            <div className="space-y-3 text-xs">
              <div className="p-3 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1">Class Teacher's Remarks:</span>
                <p className="italic text-slate-700">{data.summary.classTeacherRemarks}</p>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1">Head Teacher's Comments & Endorsement:</span>
                <p className="italic text-slate-700">{data.summary.headTeacherRemarks}</p>
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Signature: _______________________</span>
                  <span>Official Stamp: _______________________</span>
                  <span>Date: 29/10/2026</span>
                </div>
              </div>
            </div>

            {/* Financial Status on Report */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs flex items-center justify-between">
              <span className="font-bold text-amber-900">Next Term Fee Invoicing Notice:</span>
              <span className="font-mono font-bold text-amber-900">
                Current Outstanding Balance: UGX {Number(data.summary.feesBalanceUGX).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
