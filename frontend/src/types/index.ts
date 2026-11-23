export type Role = 'ADMIN' | 'RECEPTIONIST' | 'DOCTOR';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface Patient {
  id: number;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address?: string;
  emergencyContact?: string;
  medicalHistorySummary?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  consultationFee: number;
  availableDays: string;
  availableHours: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type AppointmentStatus = 'BOOKED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  patientPhone: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reasonForVisit: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt?: string;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'CANCELLED';

export interface Bill {
  id: number;
  appointmentId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  consultationFee: number;
  additionalCharges: number;
  discount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  createdAt: string;
  paidAt?: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingPayments: number;
  totalRevenue: number;
  todayRevenue: number;
  appointmentStatusDistribution: Record<string, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
