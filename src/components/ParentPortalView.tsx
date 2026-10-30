import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { User } from '../types';
import {
  HeartHandshake,
  CreditCard,
  FileText,
  CalendarCheck,
  Megaphone,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  Printer
} from 'lucide-react';

interface ParentPortalViewProps {
  currentUser: User;
  onOpenReportCard: (studentId: string) => void;
}

export const ParentPortalView: React.FC<ParentPortalViewProps> = ({
  currentUser,
  onOpenReportCard,
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);

  useEffect(() => {
    async function loadPortal() {
      setLoading(true);
      try {
        const res = await api.getParentPortalData();
        setData(res);
        if (res.students?.length > 0) {
          setSelectedChild(res.students[0]);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPortal();
  }, []);

  return (
    <div className="space-y-6">
      {/* Guardian Welcome Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded-md border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Guardian Access · Uganda MoES Compliant</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Welcome, {data?.guardian?.full_name || currentUser.fullName}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Official parent dashboard for Mwanaweika School, Mukono. Monitor attendance, terminal report cards, and school fees in UGX.
          </p>
        </div>

        <div className="text-right text-xs">
          <p className="font-semibold text-slate-700">Telephone: {data?.guardian?.phone || currentUser.phone || '+256 703 892 114'}</p>
          <p className="text-slate-400">Account: Verified Parent / Guardian</p>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading your children's records...</div>
      ) : (
        <>
          {/* Linked Children Cards */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Linked Children ({data?.students?.length || 0})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.students?.map((child: any) => {
                const isSelected = selectedChild?.id === child.id;
                return (
                  <div
                    key={child.id}
                    onClick={() => setSelectedChild(child)}
                    className={`p-5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/50 border-blue-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          {child.first_name} {child.middle_name || ''} {child.last_name}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          Adm No: <span className="font-bold text-blue-900">{child.admission_number}</span> · LIN: {child.lin || 'UG-2026'}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded">
                        {child.class_name} {child.stream_name ? `(${child.stream_name})` : ''}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Status: <span className="font-semibold text-emerald-700">{child.boarding_status} Pupil</span>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReportCard(child.id);
                        }}
                        className="flex items-center gap-1 text-blue-700 hover:text-blue-900 font-bold"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Report Card</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Child Details: Selected Child Invoices & Payments */}
          {selectedChild && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fee Invoices */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Term Fee Invoices for {selectedChild.first_name}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-medium text-emerald-700">UGX</span>
                </div>

                <div className="space-y-3">
                  {data?.invoices
                    ?.filter((inv: any) => inv.student_id === selectedChild.id)
                    .map((inv: any) => (
                      <div key={inv.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 text-xs font-mono">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900">{inv.invoice_number}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-sans font-semibold ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 mt-2">
                          <span>Total Billed: UGX {Number(inv.total_amount).toLocaleString()}</span>
                          <span className="font-bold text-amber-700">
                            Balance: UGX {Number(inv.balance).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Payment Receipts */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Official Receipts Issued
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">Stanbic / MoMo Receipts</span>
                </div>

                <div className="space-y-3">
                  {data?.payments
                    ?.filter((p: any) => p.student_id === selectedChild.id)
                    .map((p: any) => (
                      <div key={p.id} className="p-3.5 bg-emerald-50/40 rounded-lg border border-emerald-100 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 font-mono">{p.receipt_number}</span>
                          <span className="font-bold font-mono text-emerald-700">
                            UGX {Number(p.amount).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {p.payment_method} · {p.reference_code || 'Direct Counter'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Recorded on {new Date(p.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* School Broadcasts & Announcements */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
              <Megaphone className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Parental School Notices & Calendar</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.announcements?.map((a: any) => (
                <div key={a.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1.5">
                  <h4 className="font-bold text-slate-900">{a.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{a.content}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Published: {new Date(a.published_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
