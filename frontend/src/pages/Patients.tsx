import React, { useEffect, useState } from 'react';
import { api } from '../api';
import type { Patient, Role } from '../types';
import { Plus, Search, Eye, Edit2, UserX, Phone, Mail, X } from 'lucide-react';

interface PatientsProps {
  currentUserRole?: Role;
}

export const Patients: React.FC<PatientsProps> = ({ currentUserRole }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    medicalHistorySummary: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const canRegisterOrEdit = currentUserRole === 'ADMIN' || currentUserRole === 'RECEPTIONIST';
  const canDeactivate = currentUserRole === 'ADMIN';

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await api.getPatients(query);
      setPatients(res.content);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [query]);

  const openCreateModal = () => {
    setEditingPatient(null);
    setFormData({
      fullName: '',
      dateOfBirth: '',
      gender: 'Male',
      phone: '',
      email: '',
      address: '',
      emergencyContact: '',
      medicalHistorySummary: '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (p: Patient) => {
    setEditingPatient(p);
    setFormData({
      fullName: p.fullName,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      phone: p.phone,
      email: p.email,
      address: p.address || '',
      emergencyContact: p.emergencyContact || '',
      medicalHistorySummary: p.medicalHistorySummary || '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (editingPatient) {
        await api.updatePatient(editingPatient.id, formData);
      } else {
        await api.createPatient(formData);
      }
      setShowModal(false);
      loadPatients();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this patient record?')) return;
    try {
      await api.deactivatePatient(id);
      loadPatients();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patient Directory</h1>
          <p className="text-slate-500 text-sm">Manage electronic health records and patient demographics</p>
        </div>
        {canRegisterOrEdit && (
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-sky-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by patient name, phone, or email..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-400 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Patient Name</th>
                <th className="px-6 py-3.5">Contact Details</th>
                <th className="px-6 py-3.5">DOB & Gender</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400 text-xs">
                    Loading records...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 text-sm">
                    No patients registered yet.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{p.fullName}</div>
                      <div className="text-xs text-slate-400">ID #{p.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-700 flex items-center space-x-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{p.phone}</span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center space-x-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{p.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div>{p.dateOfBirth}</div>
                      <div className="text-slate-400 capitalize">{p.gender}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          p.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {p.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedPatient(p)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-sky-600 transition cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canRegisterOrEdit && (
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-amber-600 transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {canDeactivate && p.active && (
                        <button
                          onClick={() => handleDeactivate(p.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-rose-600 transition cursor-pointer"
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

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Patient Details: {selectedPatient.fullName}</h3>
              <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Date of Birth</p>
                  <p className="font-medium text-slate-800">{selectedPatient.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Gender</p>
                  <p className="font-medium text-slate-800">{selectedPatient.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Phone</p>
                  <p className="font-medium text-slate-800">{selectedPatient.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Email</p>
                  <p className="font-medium text-slate-800">{selectedPatient.email}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Address</p>
                <p className="font-medium text-slate-800">{selectedPatient.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Emergency Contact</p>
                <p className="font-medium text-slate-800">{selectedPatient.emergencyContact || 'N/A'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Medical History Summary</p>
                <p className="text-slate-700 text-xs leading-relaxed">{selectedPatient.medicalHistorySummary || 'No existing conditions reported.'}</p>
              </div>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingPatient ? 'Edit Patient Record' : 'Register New Patient'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="e.g. Jane Doe (+1-555-9999)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medical History Summary</label>
                <textarea
                  rows={2}
                  value={formData.medicalHistorySummary}
                  onChange={(e) => setFormData({ ...formData, medicalHistorySummary: e.target.value })}
                  placeholder="Known allergies, preexisting chronic conditions, etc."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-600/20 cursor-pointer"
                >
                  {editingPatient ? 'Save Changes' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
