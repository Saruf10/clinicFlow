package com.clinicflow.mapper;

import com.clinicflow.dto.request.DoctorRequest;
import com.clinicflow.dto.request.PatientRequest;
import com.clinicflow.dto.response.AppointmentResponse;
import com.clinicflow.dto.response.BillResponse;
import com.clinicflow.dto.response.DoctorResponse;
import com.clinicflow.dto.response.PatientResponse;
import com.clinicflow.entity.Appointment;
import com.clinicflow.entity.Bill;
import com.clinicflow.entity.Doctor;
import com.clinicflow.entity.Patient;
import org.springframework.stereotype.Component;

@Component
public class EntityDtoMapper {

    public PatientResponse toPatientResponse(Patient patient) {
        if (patient == null) return null;
        PatientResponse dto = new PatientResponse();
        dto.setId(patient.getId());
        dto.setFullName(patient.getFullName());
        dto.setDateOfBirth(patient.getDateOfBirth());
        dto.setGender(patient.getGender());
        dto.setPhone(patient.getPhone());
        dto.setEmail(patient.getEmail());
        dto.setAddress(patient.getAddress());
        dto.setEmergencyContact(patient.getEmergencyContact());
        dto.setMedicalHistorySummary(patient.getMedicalHistorySummary());
        dto.setActive(patient.isActive());
        dto.setCreatedAt(patient.getCreatedAt());
        dto.setUpdatedAt(patient.getUpdatedAt());
        return dto;
    }

    public void updatePatientEntity(Patient patient, PatientRequest request) {
        patient.setFullName(request.getFullName());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setPhone(request.getPhone());
        patient.setEmail(request.getEmail());
        patient.setAddress(request.getAddress());
        patient.setEmergencyContact(request.getEmergencyContact());
        patient.setMedicalHistorySummary(request.getMedicalHistorySummary());
        if (request.getActive() != null) {
            patient.setActive(request.getActive());
        }
    }

    public DoctorResponse toDoctorResponse(Doctor doctor) {
        if (doctor == null) return null;
        DoctorResponse dto = new DoctorResponse();
        dto.setId(doctor.getId());
        dto.setName(doctor.getName());
        dto.setSpecialization(doctor.getSpecialization());
        dto.setPhone(doctor.getPhone());
        dto.setEmail(doctor.getEmail());
        dto.setConsultationFee(doctor.getConsultationFee());
        dto.setAvailableDays(doctor.getAvailableDays());
        dto.setAvailableHours(doctor.getAvailableHours());
        dto.setActive(doctor.isActive());
        dto.setCreatedAt(doctor.getCreatedAt());
        dto.setUpdatedAt(doctor.getUpdatedAt());
        return dto;
    }

    public void updateDoctorEntity(Doctor doctor, DoctorRequest request) {
        doctor.setName(request.getName());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setPhone(request.getPhone());
        doctor.setEmail(request.getEmail());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setAvailableDays(request.getAvailableDays());
        doctor.setAvailableHours(request.getAvailableHours());
        if (request.getActive() != null) {
            doctor.setActive(request.getActive());
        }
    }

    public AppointmentResponse toAppointmentResponse(Appointment appointment) {
        if (appointment == null) return null;
        AppointmentResponse dto = new AppointmentResponse();
        dto.setId(appointment.getId());
        dto.setPatientId(appointment.getPatient().getId());
        dto.setPatientName(appointment.getPatient().getFullName());
        dto.setPatientPhone(appointment.getPatient().getPhone());
        dto.setDoctorId(appointment.getDoctor().getId());
        dto.setDoctorName(appointment.getDoctor().getName());
        dto.setDoctorSpecialization(appointment.getDoctor().getSpecialization());
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setStartTime(appointment.getStartTime());
        dto.setEndTime(appointment.getEndTime());
        dto.setReasonForVisit(appointment.getReasonForVisit());
        dto.setNotes(appointment.getNotes());
        dto.setStatus(appointment.getStatus());
        dto.setCreatedAt(appointment.getCreatedAt());
        dto.setUpdatedAt(appointment.getUpdatedAt());
        return dto;
    }

    public BillResponse toBillResponse(Bill bill) {
        if (bill == null) return null;
        BillResponse dto = new BillResponse();
        dto.setId(bill.getId());
        dto.setAppointmentId(bill.getAppointment().getId());
        dto.setPatientId(bill.getPatient().getId());
        dto.setPatientName(bill.getPatient().getFullName());
        dto.setDoctorId(bill.getDoctor().getId());
        dto.setDoctorName(bill.getDoctor().getName());
        dto.setConsultationFee(bill.getConsultationFee());
        dto.setAdditionalCharges(bill.getAdditionalCharges());
        dto.setDiscount(bill.getDiscount());
        dto.setTotalAmount(bill.getTotalAmount());
        dto.setPaymentStatus(bill.getPaymentStatus());
        dto.setPaymentMethod(bill.getPaymentMethod());
        dto.setCreatedAt(bill.getCreatedAt());
        dto.setPaidAt(bill.getPaidAt());
        return dto;
    }
}
