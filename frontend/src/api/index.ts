import type { ApiResponse, AuthResponse, Patient, Doctor, Appointment, Bill, DashboardStats, PageResponse } from '../types';

const BASE_URL = 'http://localhost:8080/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('clinicflow_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json: ApiResponse<T> = await res.json();
  if (!res.ok || !json.success) {
    const errorMsg = json.message || 'Request failed';
    const detail = json.errors ? Object.values(json.errors).join(', ') : '';
    throw new Error(detail ? `${errorMsg}: ${detail}` : errorMsg);
  }
  return json.data;
}

export const api = {
  // Authentication
  async login(credentials: { username: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse<AuthResponse>(res);
  },

  // Patients
  async getPatients(query = '', page = 0, size = 10): Promise<PageResponse<Patient>> {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (query) params.append('query', query);
    const res = await fetch(`${BASE_URL}/patients?${params.toString()}`, { headers: getHeaders() });
    return handleResponse<PageResponse<Patient>>(res);
  },

  async getPatient(id: number): Promise<Patient> {
    const res = await fetch(`${BASE_URL}/patients/${id}`, { headers: getHeaders() });
    return handleResponse<Patient>(res);
  },

  async createPatient(data: Partial<Patient>): Promise<Patient> {
    const res = await fetch(`${BASE_URL}/patients`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Patient>(res);
  },

  async updatePatient(id: number, data: Partial<Patient>): Promise<Patient> {
    const res = await fetch(`${BASE_URL}/patients/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Patient>(res);
  },

  async deactivatePatient(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/patients/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<void>(res);
  },

  // Doctors
  async getDoctors(query = '', specialization = '', page = 0, size = 10): Promise<PageResponse<Doctor>> {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (query) params.append('query', query);
    if (specialization) params.append('specialization', specialization);
    const res = await fetch(`${BASE_URL}/doctors?${params.toString()}`, { headers: getHeaders() });
    return handleResponse<PageResponse<Doctor>>(res);
  },

  async getActiveDoctors(): Promise<Doctor[]> {
    const res = await fetch(`${BASE_URL}/doctors/active`, { headers: getHeaders() });
    return handleResponse<Doctor[]>(res);
  },

  async getDoctor(id: number): Promise<Doctor> {
    const res = await fetch(`${BASE_URL}/doctors/${id}`, { headers: getHeaders() });
    return handleResponse<Doctor>(res);
  },

  async createDoctor(data: Partial<Doctor>): Promise<Doctor> {
    const res = await fetch(`${BASE_URL}/doctors`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Doctor>(res);
  },

  async updateDoctor(id: number, data: Partial<Doctor>): Promise<Doctor> {
    const res = await fetch(`${BASE_URL}/doctors/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Doctor>(res);
  },

  async deactivateDoctor(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/doctors/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<void>(res);
  },

  // Appointments
  async getAppointments(filters: { doctorId?: number; patientId?: number; status?: string; page?: number; size?: number } = {}): Promise<PageResponse<Appointment>> {
    const params = new URLSearchParams();
    if (filters.doctorId) params.append('doctorId', filters.doctorId.toString());
    if (filters.patientId) params.append('patientId', filters.patientId.toString());
    if (filters.status) params.append('status', filters.status);
    params.append('page', (filters.page ?? 0).toString());
    params.append('size', (filters.size ?? 10).toString());

    const res = await fetch(`${BASE_URL}/appointments?${params.toString()}`, { headers: getHeaders() });
    return handleResponse<PageResponse<Appointment>>(res);
  },

  async bookAppointment(data: {
    patientId: number;
    doctorId: number;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    reasonForVisit: string;
    notes?: string;
  }): Promise<Appointment> {
    const res = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Appointment>(res);
  },

  async rescheduleAppointment(id: number, data: { appointmentDate: string; startTime: string; endTime: string }): Promise<Appointment> {
    const res = await fetch(`${BASE_URL}/appointments/${id}/reschedule`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Appointment>(res);
  },

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment> {
    const res = await fetch(`${BASE_URL}/appointments/${id}/status?status=${status}`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse<Appointment>(res);
  },

  async cancelAppointment(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<void>(res);
  },

  // Billing
  async getBills(patientId?: number, status?: string, page = 0, size = 10): Promise<PageResponse<Bill>> {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (patientId) params.append('patientId', patientId.toString());
    if (status) params.append('status', status);
    const res = await fetch(`${BASE_URL}/bills?${params.toString()}`, { headers: getHeaders() });
    return handleResponse<PageResponse<Bill>>(res);
  },

  async generateBill(data: {
    appointmentId: number;
    additionalCharges?: number;
    discount?: number;
    paymentMethod?: string;
  }): Promise<Bill> {
    const res = await fetch(`${BASE_URL}/bills`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Bill>(res);
  },

  async updatePaymentStatus(id: number, data: { paymentStatus: string; paymentMethod?: string }): Promise<Bill> {
    const res = await fetch(`${BASE_URL}/bills/${id}/payment`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Bill>(res);
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${BASE_URL}/dashboard/stats`, { headers: getHeaders() });
    return handleResponse<DashboardStats>(res);
  },

  async getRevenueStats(): Promise<Record<string, number>> {
    const res = await fetch(`${BASE_URL}/dashboard/revenue`, { headers: getHeaders() });
    return handleResponse<Record<string, number>>(res);
  },
};
