package com.clinicflow.service;

import com.clinicflow.dto.request.AppointmentRequest;
import com.clinicflow.dto.request.RescheduleRequest;
import com.clinicflow.dto.response.AppointmentResponse;
import com.clinicflow.entity.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentService {
    AppointmentResponse bookAppointment(AppointmentRequest request);
    AppointmentResponse getAppointmentById(Long id);
    Page<AppointmentResponse> getAppointments(Long doctorId, Long patientId, AppointmentStatus status,
                                             LocalDate dateFrom, LocalDate dateTo, Pageable pageable);
    AppointmentResponse rescheduleAppointment(Long id, RescheduleRequest request);
    AppointmentResponse updateStatus(Long id, AppointmentStatus status);
    void cancelAppointment(Long id);
    List<AppointmentResponse> getAppointmentsByDoctorAndDate(Long doctorId, LocalDate date);
}
