import React, { useEffect, useState } from 'react';
import { api } from '../api';
import type { Appointment, Doctor, Patient, AppointmentStatus } from '../types';
import { 
  CalendarDays, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Calendar,
  X,
  CreditCard
} from 'lucide-react';

interface AppointmentsProps {
  onNavigateToBilling?: (appointmentId: number) => void;
}

export const Appointments: React.FC<AppointmentsProps> = ({ onNavigateToBilling }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  
  // Modals
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState<Appointment | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Booking Form State
  const [patientId, setPatientId] = useState<number | ''>('');
  const [doctorId, setDoctorId] = useState<number | ''>('');
  const [appointmentDate, setAppointmentDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:30');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Reschedule Form State
  const [reschedDate, setReschedDate] = useState('');
  const [reschedStart, setReschedStart] = useState('');
  const [reschedEnd, setReschedEnd] = useState('');
  const [reschedError, setReschedError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apptRes, docs, pts] = await Promise.all([
        api.getAppointments({ status: filterStatus || undefined }),
        api.getActiveDoctors(),
        api.getPatients('', 0, 50),
      ]);
      setAppointments(apptRes.content);
      setDoctors(docs);
      setPatients(pts.content.filter(p => p.active));
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!patientId || !doctorId) {
      setFormError('Please select both a patient and a doctor.');
      return;
    }
    try {
      await api.bookAppointment({
        patientId: Number(patientId),
        doctorId: Number(doctorId),
        appointmentDate,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        reasonForVisit,
        notes,
      });
      setShowBookingModal(false);
      setReasonForVisit('');
      setNotes('');
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to book appointment');
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRescheduleModal) return;
    setReschedError(null);
    try {
      await api.rescheduleAppointment(showRescheduleModal.id, {
        appointmentDate: reschedDate,
        startTime: `${reschedStart}:00`,
        endTime: `${reschedEnd}:00`,
      });
      setShowRescheduleModal(null);
      loadData();
    } catch (err: any) {
      setReschedError(err.message || 'Rescheduling conflict');
    }
  };

  const handleStatusUpdate = async (id: number, status: AppointmentStatus) => {
    try {
      await api.updateAppointmentStatus(id, status);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.cancelAppointment(id);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'BOOKED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CONFIRMED':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'NO_SHOW':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Appointment Management</h1>
          <p className="text-slate-500 text-sm">Schedule consultations, manage double-booking conflict checks, and session states</p>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-sky-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {['', 'BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterStatus === st
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st === '' ? 'All Sessions' : st}
          </button>
        ))}
      </div>

      {/* Appointments List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-400 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Schedule</th>
                <th className="px-6 py-3.5">Patient</th>
                <th className="px-6 py-3.5">Doctor & Specialty</th>
                <th className="px-6 py-3.5">Reason</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                    Loading appointments...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    No appointments found matching current filters.
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-sky-600" />
                        <span>{a.appointmentDate}</span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center space-x-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{a.startTime.substring(0, 5)} - {a.endTime.substring(0, 5)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{a.patientName}</div>
                      <div className="text-xs text-slate-400">{a.patientPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{a.doctorName}</div>
                      <div className="text-xs text-sky-600">{a.doctorSpecialization}</div>
                    </td>
                    <td className="px-6 py-4 text-xs max-w-[200px] truncate" title={a.reasonForVisit}>
                      {a.reasonForVisit}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(a.id, 'COMPLETED')}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition"
                            title="Mark Completed"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setShowRescheduleModal(a);
                              setReschedDate(a.appointmentDate);
                              setReschedStart(a.startTime.substring(0, 5));
                              setReschedEnd(a.endTime.substring(0, 5));
                              setReschedError(null);
                            }}
                            className="p-1.5 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition"
                            title="Reschedule"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancel(a.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {a.status === 'COMPLETED' && onNavigateToBilling && (
                        <button
                          onClick={() => onNavigateToBilling(a.id)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition inline-flex items-center space-x-1"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Bill</span>
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

      {/* Book Appointment Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Schedule Appointment</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleBook} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient *</label>
                  <select
                    required
                    value={patientId}
                    onChange={(e) => setPatientId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.phone})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Doctor *</label>
                  <select
                    required
                    value={doctorId}
                    onChange={(e) => setDoctorId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialization} - ${d.consultationFee})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Visit *</label>
                <input
                  type="text"
                  required
                  placeholder="Primary complaint or consultation reason"
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional patient notes, lab requests, or history..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-600/20"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Reschedule Appointment</h3>
              <button onClick={() => setShowRescheduleModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reschedError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {reschedError}
              </div>
            )}

            <form onSubmit={handleReschedule} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={reschedDate}
                  onChange={(e) => setReschedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={reschedStart}
                    onChange={(e) => setReschedStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={reschedEnd}
                    onChange={(e) => setReschedEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-600/20"
                >
                  Update Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
