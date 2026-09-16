import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  DollarSign,
  Building2,
  ShieldCheck,
  Receipt,
  Smartphone,
  Wallet
} from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { Fee, Payment } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

export const FeesView: React.FC = () => {
  const { currentUser, currentStudent } = useAuth();
  const [invoices, setInvoices] = useState<Fee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Fee | null>(null);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<Payment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const [invRes, payRes] = await Promise.all([api.getFees(), api.getPayments()]);
      if (invRes.success) setInvoices(invRes.fees);
      if (payRes.success) setPayments(payRes.payments);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    if (currentUser?.role === 'student' && currentStudent && inv.studentId !== currentStudent.id) {
      return false;
    }
    return true;
  });

  const handlePayInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;
    setIsProcessing(true);

    try {
      const res = await api.recordPayment({
        feeId: selectedInvoiceForPayment.id,
        studentId: selectedInvoiceForPayment.studentId,
        amount: selectedInvoiceForPayment.amount - selectedInvoiceForPayment.paidAmount,
        paymentMethod,
      });

      if (res.success && res.payment) {
        setSelectedInvoiceForPayment(null);
        setSelectedPaymentForReceipt(res.payment);
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hostel & Mess Fee Invoicing</h1>
          <p className="text-xs text-slate-500">Manage term fees, mess subscriptions, online payments & verified receipts</p>
        </div>
      </div>

      {/* INVOICES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredInvoices.map(inv => {
          const isPaid = inv.status === 'paid';
          const balance = inv.amount - inv.paidAmount;

          return (
            <div key={inv.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{inv.id.toUpperCase()}</span>
                    <h3 className="text-sm font-bold text-slate-900 capitalize mt-0.5">{inv.feeType.replace('_', ' ')}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {inv.status}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Total Invoice Due</span>
                    <span className="text-2xl font-black text-slate-900">₹{inv.amount.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Academic Term</span>
                    <span className="text-xs font-semibold text-indigo-900">{inv.semester}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Resident:</span>
                    <span className="font-semibold text-slate-900">{inv.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span className="font-medium text-slate-800">{new Date(inv.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span>Balance Remaining:</span>
                    <span className={`font-bold ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ₹{balance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                {!isPaid ? (
                  <button
                    onClick={() => setSelectedInvoiceForPayment(inv)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Dues Online (₹{balance.toLocaleString()})</span>
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-center space-x-1 text-xs text-emerald-700 font-bold bg-emerald-50 py-2 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Payment Fully Settled</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* COMPLETED PAYMENTS & VERIFIED RECEIPTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Payment Transaction Ledger & Verified Receipts</h3>
            <p className="text-xs text-slate-500">Official digital receipts with transaction tokens</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Receipt / Txn Ref</th>
                <th className="px-4 py-3">Resident</th>
                <th className="px-4 py-3">Paid Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400">No payment receipts generated yet.</td>
                </tr>
              ) : (
                payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{p.receiptNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{p.studentName}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-bold text-emerald-700">₹{p.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 capitalize text-slate-600">{p.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedPaymentForReceipt(p)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[10px] font-semibold transition-colors flex items-center space-x-1 ml-auto cursor-pointer"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>View Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: PAY NOW SIMULATOR */}
      {selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Hostel Fee Checkout</h3>
              </div>
              <button onClick={() => setSelectedInvoiceForPayment(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="mt-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Fee Category:</span>
                <span className="font-semibold text-slate-900 capitalize">{selectedInvoiceForPayment.feeType.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Amount Due:</span>
                <span className="font-black text-indigo-700 text-sm">
                  ₹{(selectedInvoiceForPayment.amount - selectedInvoiceForPayment.paidAmount).toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handlePayInvoice} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Select Payment Gateway</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                      paymentMethod === 'upi' ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-600/20' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                      paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-600/20' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                    <span>Debit / Credit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                      paymentMethod === 'netbanking' ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-600/20' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                    <span>NetBanking</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center space-x-2 text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>256-bit SSL encrypted institutional payment gateway sandbox.</span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPayment(null)}
                  className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {isProcessing ? 'Authorizing Payment...' : 'Authorize & Pay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE OFFICIAL FEE RECEIPT */}
      {selectedPaymentForReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase">Official University Receipt</span>
              <button onClick={() => setSelectedPaymentForReceipt(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            {/* Receipt Printable Card */}
            <div className="mt-4 p-6 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-4">
              <div className="text-center pb-4 border-b border-slate-200">
                <h2 className="text-base font-black text-slate-900 tracking-tight">CAMPUS RESIDENTIAL ACCOMMODATION</h2>
                <p className="text-[11px] text-slate-500">Student Housing & Mess Management Bureau</p>
                <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                  Payment Status: Confirmed & Paid
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Receipt Number</span>
                  <span className="font-bold text-slate-900">{selectedPaymentForReceipt.receiptNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Transaction Ref</span>
                  <span className="font-mono text-slate-700 text-[11px]">{selectedPaymentForReceipt.transactionId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Student Name</span>
                  <span className="font-semibold text-slate-800">{selectedPaymentForReceipt.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Payment Date</span>
                  <span className="text-slate-800">{new Date(selectedPaymentForReceipt.paymentDate).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">Total Paid Amount:</span>
                <span className="text-base font-black text-emerald-700">₹{selectedPaymentForReceipt.amount.toLocaleString()}</span>
              </div>

              <div className="text-[10px] text-slate-400 text-center">
                This is a computer generated verifiable receipt. No physical signature required.
              </div>
            </div>

            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setSelectedPaymentForReceipt(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
