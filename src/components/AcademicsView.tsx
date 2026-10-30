import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { SchoolClass, Subject, Assessment } from '../types';
import {
  GraduationCap,
  Save,
  CheckCircle2,
  FileText,
  Layers,
  Award,
  Filter
} from 'lucide-react';

interface AcademicsViewProps {
  classes: SchoolClass[];
  subjects: Subject[];
  assessments: Assessment[];
  onOpenReportCard: (studentId: string) => void;
}

export const AcademicsView: React.FC<AcademicsViewProps> = ({
  classes,
  subjects,
  assessments,
  onOpenReportCard,
}) => {
  const [selectedAssessment, setSelectedAssessment] = useState('asm-mot-2026');
  const [selectedClass, setSelectedClass] = useState('cls-p7');
  const [selectedSubject, setSelectedSubject] = useState('sb-math');
  const [marksList, setMarksList] = useState<any[]>([]);
  const [scoresMap, setScoresMap] = useState<Record<string, { score: string; comment?: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchMarks = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await api.getMarks({
        assessment_id: selectedAssessment,
        class_id: selectedClass,
        subject_id: selectedSubject,
      });
      setMarksList(data);

      const initialMap: Record<string, { score: string; comment?: string }> = {};
      data.forEach((m) => {
        initialMap[m.student_id] = {
          score: m.score !== null && m.score !== undefined ? String(m.score) : '',
          comment: m.teacher_comment || '',
        };
      });
      setScoresMap(initialMap);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarks();
  }, [selectedAssessment, selectedClass, selectedSubject]);

  const handleScoreChange = (studentId: string, val: string) => {
    setScoresMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: val,
      },
    }));
  };

  const handleCommentChange = (studentId: string, val: string) => {
    setScoresMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        comment: val,
      },
    }));
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    try {
      const formattedMarks = Object.keys(scoresMap).map((student_id) => ({
        student_id,
        score: scoresMap[student_id].score,
        teacher_comment: scoresMap[student_id].comment,
      }));

      await api.saveMarks({
        assessment_id: selectedAssessment,
        class_id: selectedClass,
        subject_id: selectedSubject,
        marks: formattedMarks,
      });

      setMessage('Subject marks saved, UNEB grades calculated, and published successfully.');
      setTimeout(() => setMessage(null), 4000);
      fetchMarks();
    } catch (err: any) {
      alert(err.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Control Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Continuous Assessment & Examinations
            </h3>
            <p className="text-xs text-slate-500">
              Subject mark entry, automated Ugandan UNEB grading (D1, D2, C3–F9), and competency assessment descriptors.
            </p>
          </div>
          <button
            onClick={handleSaveMarks}
            disabled={saving || marksList.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Save & Publish Marks'}</span>
          </button>
        </div>

        {/* Filter selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Assessment Period</label>
            <select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
            >
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

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
            <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) - {s.category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading student marksheet...</div>
        ) : marksList.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No enrolled students in this class.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Learner Name</th>
                  <th className="py-3 px-4">Admission No.</th>
                  <th className="py-3 px-4 w-32 text-center">Score (Max 100)</th>
                  <th className="py-3 px-4 text-center">UNEB Grade</th>
                  <th className="py-3 px-4">Subject Remarks / Competency</th>
                  <th className="py-3 px-4 text-center">Report Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {marksList.map((m) => {
                  const currentScore = scoresMap[m.student_id]?.score || '';
                  const currentComment = scoresMap[m.student_id]?.comment || '';

                  // Inline grade preview
                  let previewGrade = m.grade || '-';
                  if (currentScore) {
                    const num = Number(currentScore);
                    if (num >= 80) previewGrade = 'D1';
                    else if (num >= 70) previewGrade = 'D2';
                    else if (num >= 60) previewGrade = 'C3';
                    else if (num >= 50) previewGrade = 'C4';
                    else if (num >= 45) previewGrade = 'P7';
                    else previewGrade = 'F9';
                  }

                  return (
                    <tr key={m.student_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {m.first_name} {m.last_name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {m.admission_number}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={currentScore}
                          onChange={(e) => handleScoreChange(m.student_id, e.target.value)}
                          placeholder="e.g. 85"
                          className="w-20 px-2.5 py-1.5 text-center font-mono font-bold text-blue-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                            previewGrade.startsWith('D')
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : previewGrade.startsWith('C')
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {previewGrade}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={currentComment}
                          onChange={(e) => handleCommentChange(m.student_id, e.target.value)}
                          placeholder="Enter teacher observation / descriptor..."
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onOpenReportCard(m.student_id)}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors"
                          title="Generate Pupil Report Card"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
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
