import React, { useEffect, useState } from 'react';
import { api } from '../api';
import type { Bill, PaymentStatus } from '../types';
import { 
  Receipt, 
  Plus, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  User, 
  Stethoscope, 
  DollarSign, 
  X, 
  AlertCircle 
} from 'lucide-react';

interface BillingProps {
  initialAppointmentId?: number | null;
}

export const Billing: React.FC<BillingProps> = ({ initialAppointmentId }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  
  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentModalBill, setPaymentModalBill] = useState<Bill | null>(null);

  // Generate Bill State
  const [appointmentId, setAppointmentId] = useState<number | ''>(initialAppointmentId || '');
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [formError, setFormError] = useState<string | null>(null);

  // Pay Bill State
  const [payMethod, setPayMethod] = useState('CREDIT_CARD');

  const loadBills = async () => {
    setLoading(true);
    try {
      const res = await api.getBills(undefined, filterStatus || undefined);
      setBills(res.content);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
    if (initialAppointmentId) {
      setAppointmentId(initialAppointmentId);
      setShowGenerateModal(true);
    }
  }, [filterStatus, initialAppointmentId]);

  const handleGenerateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!appointmentId) {
      setFormError('Please enter a valid appointment ID.');
      return;
    }
    try {
      await api.generateBill({
        appointmentId: Number(appointmentId),
        additionalCharges: Number(additionalCharges),
        discount: Number(discount),
        paymentMethod,
      });
      setShowGenerateModal(false);
      setAppointmentId('');
      setAdditionalCharges(0);
      setDiscount(0);
      loadBills();
    } catch (err: any) {
      setFormError(err.message || 'Failed to generate invoice');
    }
  };

  const handleMarkPaid = async (billId: number) => {
    try {
      await api.updatePaymentStatus(billId, {
        paymentStatus: 'PAID',
        paymentMethod: payMethod,
      });
      setPaymentModalBill(null);
      loadBills();
    } catch (err: any) {
      alert(err.message || 'Failed to update payment status');
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PARTIALLY_PAID':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Billing & Invoices</h1>
          <p className="text-slate-500 text-sm">Generate consultation invoices, manage patient statements, and track settlement</p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setShowGenerateModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-sky-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Invoice</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        {['', 'PENDING', 'PAID', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterStatus === st
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st === '' ? 'All Invoices' : st}
          </button>
        ))}
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-400 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Invoice #</th>
                <th className="px-6 py-3.5">Patient</th>
                <th className="px-6 py-3.5">Doctor & Service</th>
                <th className="px-6 py-3.5">Total Amount</th>
                <th className="px-6 py-3.5">Payment Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                    Loading invoices...
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    No billing statements found.
                  </td>
                </tr>
              ) : (
                bills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">INV-{b.id.toString().padStart(5, '0')}</div>
                      <div className="text-xs text-slate-400">Appt #{b.appointmentId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{b.patientName}</div>
                      <div className="text-xs text-slate-400">ID #{b.patientId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{b.doctorName}</div>
                      <div className="text-xs text-slate-400">Fee: ${b.consultationFee.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      ${b.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(b.paymentStatus)}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedBill(b)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition"
                      >
                        Details
                      </button>
                      {b.paymentStatus === 'PENDING' && (
                        <button
                          onClick={() => setPaymentModalBill(b)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm transition"
                        >
                          Collect
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Details Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Invoice Statement</h3>
                <p className="text-xs text-slate-400">INV-{selectedBill.id.toString().padStart(5, '0')}</p>
              </div>
              <button onClick={() => setSelectedBill(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Patient:</span>
                <span className="font-semibold text-slate-800">{selectedBill.patientName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-semibold text-slate-800">{selectedBill.doctorName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Consultation Fee:</span>
                <span className="text-slate-800">${selectedBill.consultationFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Additional Charges:</span>
                <span className="text-slate-800">+${selectedBill.additionalCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Discount:</span>
                <span className="text-emerald-600">-${selectedBill.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-base font-bold border-t border-slate-200">
                <span className="text-slate-800">Total Settlement:</span>
                <span className="text-sky-600">${selectedBill.totalAmount.toFixed(2)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Status:</span>
                  <span className="font-semibold text-slate-700">{selectedBill.paymentStatus}</span>
                </div>
                {selectedBill.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Method:</span>
                    <span className="font-medium text-slate-700">{selectedBill.paymentMethod}</span>
                  </div>
                )}
                {selectedBill.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Settled On:</span>
                    <span className="font-medium text-slate-700">{selectedBill.paidAt.substring(0, 10)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedBill(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collect Payment Modal */}
      {paymentModalBill && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Process Settlement</h3>
              <button onClick={() => setPaymentModalBill(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2">
              <p className="text-xs text-slate-400 uppercase font-semibold">Total Due</p>
              <p className="text-3xl font-extrabold text-slate-800 mt-1">${paymentModalBill.totalAmount.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">Patient: {paymentModalBill.patientName}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="CREDIT_CARD">Credit / Debit Card</option>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI / Digital Transfer</option>
                <option value="INSURANCE">Insurance Coverage</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setPaymentModalBill(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleMarkPaid(paymentModalBill.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Bill Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Generate Invoice</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleGenerateBill} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment ID *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1, 2, 3..."
                  value={appointmentId}
                  onChange={(e) => setAppointmentId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400">Note: Must be a non-cancelled appointment without an existing invoice.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Charges ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={additionalCharges}
                    onChange={(e) => setAdditionalCharges(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="INSURANCE">Insurance</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-600/20"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
