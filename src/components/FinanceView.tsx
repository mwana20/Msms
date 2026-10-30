import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Invoice, Payment, Expense } from '../types';
import {
  CreditCard,
  PlusCircle,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  X,
  CheckCircle2,
  AlertCircle,
  DollarSign
} from 'lucide-react';

export const FinanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'expenses' | 'structures'>('invoices');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // New Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MTN Mobile Money');
  const [refCode, setRefCode] = useState('');
  const [notes, setNotes] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);

  // New Expense Modal state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Kitchen & Food Supplies',
    amount: '',
    payment_method: 'Cash',
    recipient: '',
    reference_no: '',
    description: '',
  });
  const [recordingExpense, setRecordingExpense] = useState(false);

  const [message, setMessage] = useState<string | null>(null);

  const fetchFinance = async () => {
    setLoading(true);
    try {
      const res = await api.getFinanceOverview();
      setData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPaymentAmount(String(inv.balance));
    setShowPaymentModal(true);
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setRecordingPayment(true);
    try {
      const res = await api.recordPayment({
        invoice_id: selectedInvoice.id,
        student_id: selectedInvoice.student_id,
        amount: Number(paymentAmount),
        payment_method: paymentMethod,
        reference_code: refCode,
        notes,
      });

      setMessage(`Payment recorded! Official Receipt Number: ${res.receiptNumber}`);
      setShowPaymentModal(false);
      fetchFinance();
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Payment recording failed');
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleRecordExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecordingExpense(true);
    try {
      await api.recordExpense(expenseForm);
      setMessage('Expense transaction logged to school cashbook.');
      setShowExpenseModal(false);
      setExpenseForm({
        category: 'Kitchen & Food Supplies',
        amount: '',
        payment_method: 'Cash',
        recipient: '',
        reference_no: '',
        description: '',
      });
      fetchFinance();
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Expense logging failed');
    } finally {
      setRecordingExpense(false);
    }
  };

  const totals = data?.totals || {
    total_collected: 1500000,
    total_arrears: 400000,
    total_expenses: 3050000,
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Fees Collected</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
            UGX {Number(totals.total_collected).toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-slate-500">Receipted via MoMo, Bank & Cash</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Outstanding Fee Arrears</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-amber-700">
            UGX {Number(totals.total_arrears).toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-slate-500">Term I pending student balances</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Disbursements & Cashbook</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-rose-700">
            UGX {Number(totals.total_expenses).toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-slate-500">Utilities, supplies, food & maintenance</p>
        </div>
      </div>

      {/* Action Header & Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'invoices' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Invoices ({data?.invoices?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'payments' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Payment Receipts ({data?.payments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'expenses' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cashbook Expenses ({data?.expenses?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('structures')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'structures' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fee Structures
          </button>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-rose-600" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading ledger data...</div>
        ) : activeTab === 'invoices' ? (
          /* INVOICES TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice No.</th>
                  <th className="py-3 px-4">Learner Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4 text-right">Payable (UGX)</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {data?.invoices?.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-blue-900">{inv.invoice_number}</td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">
                      {inv.first_name} {inv.last_name}
                      <span className="block text-[11px] text-slate-400 font-mono">{inv.admission_number}</span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600">{inv.class_name}</td>
                    <td className="py-3 px-4 text-right text-slate-900 font-bold">
                      {Number(inv.payable_amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      {inv.balance > 0 ? (
                        <span className="text-amber-700">{Number(inv.balance).toLocaleString()}</span>
                      ) : (
                        <span className="text-emerald-700">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.status === 'Partially Paid'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      {inv.balance > 0 ? (
                        <button
                          onClick={() => handleOpenPayment(inv)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs"
                        >
                          Receive Payment
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Paid in Full</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'payments' ? (
          /* PAYMENTS TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Receipt No.</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Learner</th>
                  <th className="py-3 px-4">Method & Reference</th>
                  <th className="py-3 px-4 text-right">Amount Received</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {data?.payments?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-emerald-700">{p.receipt_number}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-sans text-slate-900 font-medium">
                      {p.first_name} {p.last_name} ({p.admission_number})
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-700">
                      <span className="font-semibold">{p.payment_method}</span>
                      {p.reference_code && <span className="block text-[11px] font-mono text-slate-400">Ref: {p.reference_code}</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      UGX {Number(p.amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 text-[11px]">{p.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'expenses' ? (
          /* EXPENSES TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Expense Category</th>
                  <th className="py-3 px-4">Beneficiary / Recipient</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount (UGX)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.expenses?.map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono text-slate-500">{e.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{e.category}</td>
                    <td className="py-3 px-4 text-slate-700">{e.recipient}</td>
                    <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs">{e.description}</td>
                    <td className="py-3 px-4 text-slate-600">{e.payment_method}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                      UGX {Number(e.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* FEE STRUCTURES */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Fee Category</th>
                  <th className="py-3 px-4">Boarding Specification</th>
                  <th className="py-3 px-4 text-right">Rate (UGX per Term)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.feeStructures?.map((f: any) => (
                  <tr key={f.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">{f.class_name} ({f.class_code})</td>
                    <td className="py-3 px-4 text-slate-700">{f.category}</td>
                    <td className="py-3 px-4 text-slate-600">{f.boarding_status}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-900">
                      UGX {Number(f.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Record Fee Payment</h3>
                <p className="text-xs text-slate-300">Invoice: {selectedInvoice.invoice_number}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border text-xs">
                <span className="text-slate-500">Learner:</span>{' '}
                <span className="font-bold text-slate-900">
                  {selectedInvoice.first_name} {selectedInvoice.last_name} ({selectedInvoice.admission_number})
                </span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-slate-500">Outstanding Balance:</span>
                  <span className="font-mono font-bold text-amber-700">
                    UGX {Number(selectedInvoice.balance).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Payment Amount (UGX) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedInvoice.balance}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono font-bold border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Payment Channel *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="MTN Mobile Money">MTN Mobile Money</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Bank Transfer">Stanbic Bank Mukono Deposit</option>
                  <option value="Cash">Cash at Bursar's Office</option>
                  <option value="Cheque">Bank Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Transaction Ref / Slip Code</label>
                <input
                  type="text"
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value)}
                  placeholder="e.g. MM-UG-9941203 or Stanbic Slip No."
                  className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Notes / Description</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid by Parent via MoMo agent"
                  className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  {recordingPayment ? 'Generating Receipt...' : 'Confirm & Issue Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Record School Expense</h3>
                <p className="text-xs text-slate-300">Log cashbook voucher / bank disbursement</p>
              </div>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordExpenseSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Expense Category *</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Kitchen & Food Supplies">Kitchen & Boarding Food Supplies</option>
                  <option value="Utilities & Electricity">Utilities (Umeme & Water)</option>
                  <option value="Stationery & Examination Printing">Stationery & Examination Printing</option>
                  <option value="Vehicle Fuel & Maintenance">Transport Fuel & Vehicle Repairs</option>
                  <option value="Laboratory Supplies">Science Lab Consumables</option>
                  <option value="Sanitation & Cleaning">Sanitation & Hygiene Materials</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Disbursement Amount (UGX) *</label>
                <input
                  type="number"
                  required
                  min="100"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="e.g. 350000"
                  className="w-full px-3 py-2 font-mono font-bold border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Recipient / Supplier *</label>
                <input
                  type="text"
                  required
                  value={expenseForm.recipient}
                  onChange={(e) => setExpenseForm({ ...expenseForm, recipient: e.target.value })}
                  placeholder="e.g. Umeme Mukono Branch or Kyaggwe Farmers"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Payment Method *</label>
                <select
                  value={expenseForm.payment_method}
                  onChange={(e) => setExpenseForm({ ...expenseForm, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="MTN Mobile Money">MTN Mobile Money</option>
                  <option value="Cheque">Bank Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description / Purpose *</label>
                <textarea
                  rows={2}
                  required
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="Describe items purchased or purpose..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border rounded-lg font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingExpense}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold shadow-sm disabled:opacity-50"
                >
                  {recordingExpense ? 'Logging...' : 'Post to Cashbook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
