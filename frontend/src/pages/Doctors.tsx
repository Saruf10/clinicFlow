import React, { useEffect, useState } from 'react';
import { api } from '../api';
import type { Doctor } from '../types';
import { Plus, Search, Eye, Edit2, UserX, Phone, Mail, Stethoscope, DollarSign, Clock, X } from 'lucide-react';

export const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [query, setQuery] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    specialization: 'Cardiology',
    phone: '',
    email: '',
    consultationFee: 150,
    availableDays: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY',
    availableHours: '09:00 - 17:00',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.getDoctors(query, specialization);
      setDoctors(res.content);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [query, specialization]);

  const openCreateModal = () => {
    setEditingDoctor(null);
    setFormData({
      name: '',
      specialization: 'Cardiology',
      phone: '',
      email: '',
      consultationFee: 150,
      availableDays: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY',
      availableHours: '09:00 - 17:00',
    });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (d: Doctor) => {
    setEditingDoctor(d);
    setFormData({
      name: d.name,
      specialization: d.specialization,
      phone: d.phone,
      email: d.email,
      consultationFee: d.consultationFee,
      availableDays: d.availableDays,
      availableHours: d.availableHours,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (editingDoctor) {
        await api.updateDoctor(editingDoctor.id, formData);
      } else {
        await api.createDoctor(formData);
      }
      setShowModal(false);
      loadDoctors();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this doctor profile?')) return;
    try {
      await api.deactivateDoctor(id);
      loadDoctors();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Medical Specialists</h1>
          <p className="text-slate-500 text-sm">Doctor directory, scheduling availability, and consultation rates</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-sky-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Doctor</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search doctors by name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <select
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">All Specializations</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Dermatology">Dermatology</option>
          <option value="Pediatrics">Pediatrics</option>
          <option value="Orthopedics">Orthopedics</option>
          <option value="Neurology">Neurology</option>
        </select>
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-400 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Doctor & Specialty</th>
                <th className="px-6 py-3.5">Contact</th>
                <th className="px-6 py-3.5">Consultation Fee</th>
                <th className="px-6 py-3.5">Availability</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                    Loading medical staff...
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    No doctor profiles found.
                  </td>
                </tr>
              ) : (
                doctors.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{d.name}</div>
                      <div className="text-xs text-sky-600 font-medium">{d.specialization}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-700 flex items-center space-x-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{d.phone}</span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center space-x-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{d.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                      ${d.consultationFee.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="text-slate-700">{d.availableHours}</div>
                      <div className="text-slate-400 text-[10px] truncate max-w-[140px]">{d.availableDays}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          d.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {d.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedDoctor(d)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-sky-600 transition"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(d)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-amber-600 transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {d.active && (
                        <button
                          onClick={() => handleDeactivate(d.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-rose-600 transition"
                          title="Deactivate"
                        >
                          <UserX className="w-4 h-4" />
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

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{selectedDoctor.name}</h3>
                <p className="text-xs text-sky-600 font-semibold">{selectedDoctor.specialization}</p>
              </div>
              <button onClick={() => setSelectedDoctor(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Consultation Fee</p>
                  <p className="font-semibold text-slate-800">${selectedDoctor.consultationFee.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Status</p>
                  <p className="font-semibold text-emerald-600">{selectedDoctor.active ? 'Active' : 'Inactive'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Phone</p>
                  <p className="font-medium text-slate-800">{selectedDoctor.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Email</p>
                  <p className="font-medium text-slate-800">{selectedDoctor.email}</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <p className="text-xs text-slate-500 uppercase font-semibold">Available Hours</p>
                <p className="text-slate-700 text-xs">{selectedDoctor.availableHours}</p>
                <p className="text-xs text-slate-500 uppercase font-semibold mt-2">Available Days</p>
                <p className="text-slate-700 text-xs">{selectedDoctor.availableDays}</p>
              </div>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingDoctor ? 'Edit Doctor Profile' : 'Add New Doctor'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization *</label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="General Medicine">General Medicine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Fee ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Available Hours *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 09:00 - 17:00"
                  value={formData.availableHours}
                  onChange={(e) => setFormData({ ...formData, availableHours: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Available Days (comma-separated) *</label>
                <input
                  type="text"
                  required
                  value={formData.availableDays}
                  onChange={(e) => setFormData({ ...formData, availableDays: e.target.value })}
                  placeholder="MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-600/20"
                >
                  {editingDoctor ? 'Save Changes' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
