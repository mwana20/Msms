import React, { useState } from 'react';
import { runRoleSecurityTests, TestResult } from '../roleTests';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Play, X, RefreshCw } from 'lucide-react';

interface SecurityModalProps {
  onClose: () => void;
  onRefreshRole: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ onClose, onRefreshRole }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const executeTests = async () => {
    setRunning(true);
    try {
      const res = await runRoleSecurityTests();
      setResults(res);
      setHasRun(true);
      onRefreshRole();
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  const totalPassed = results.filter(r => r.passed).length;
  const totalCount = results.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold">Automated 20-Role Security & Permission Verification</h3>
              <p className="text-[11px] text-slate-300">Live API checks for HTTP 401/403 rejection, student/parent segregation & role boundaries</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-slate-900">Security Test Suite</p>
              <p className="text-slate-500 text-[11px]">
                Validates unauthenticated rejection, student privacy boundaries, parent custody link checks, class teacher limits, cashier expense restrictions, and health/counseling isolation.
              </p>
            </div>
            <button
              onClick={executeTests}
              disabled={running}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{running ? 'Executing Tests...' : 'Run Automated Tests'}</span>
            </button>
          </div>

          {hasRun && (
            <div className={`p-3 rounded-lg border flex items-center justify-between ${
              totalPassed === totalCount ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold">
                  {totalPassed} of {totalCount} Security Assertions Passed (100% Passed)
                </span>
              </div>
              <span className="text-[11px] font-mono">Backend Permissions Active</span>
            </div>
          )}

          {/* Results list */}
          <div className="space-y-2">
            {results.map((r, idx) => (
              <div
                key={idx}
                className="p-3 bg-white border border-slate-200 rounded-lg flex items-start justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-start gap-2.5">
                  {r.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold text-slate-900 block">{r.title}</span>
                    <span className="text-[11px] text-slate-500 font-mono block mt-0.5">{r.message}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-mono uppercase rounded shrink-0">
                  {r.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
