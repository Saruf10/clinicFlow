package com.clinicflow.service;

import com.clinicflow.dto.request.AppointmentRequest;
import com.clinicflow.dto.response.AppointmentResponse;
import com.clinicflow.entity.Appointment;
import com.clinicflow.entity.AppointmentStatus;
import com.clinicflow.entity.Doctor;
import com.clinicflow.entity.Patient;
import com.clinicflow.exception.BadRequestException;
import com.clinicflow.exception.ConflictException;
import com.clinicflow.exception.ResourceNotFoundException;
import com.clinicflow.mapper.EntityDtoMapper;
import com.clinicflow.repository.AppointmentRepository;
import com.clinicflow.repository.DoctorRepository;
import com.clinicflow.repository.PatientRepository;
import com.clinicflow.service.impl.AppointmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private EntityDtoMapper mapper;

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    private Patient patient;
    private Doctor doctor;
    private AppointmentRequest request;

    @BeforeEach
    void setUp() {
        patient = new Patient("Clara", LocalDate.of(1995, 5, 5), "Female", "+1-555-2222",
                "clara@example.com", "Address", "Contact", "None");
        patient.setId(10L);
        patient.setActive(true);

        doctor = new Doctor("Dr. Smith", "Cardiology", "+1-555-3333", "smith@clinicflow.io",
                new BigDecimal("200.00"), "MONDAY", "09:00 - 17:00");
        doctor.setId(20L);
        doctor.setActive(true);

        request = new AppointmentRequest();
        request.setPatientId(10L);
        request.setDoctorId(20L);
        request.setAppointmentDate(LocalDate.now().plusDays(1));
        request.setStartTime(LocalTime.of(10, 0));
        request.setEndTime(LocalTime.of(10, 30));
        request.setReasonForVisit("Annual checkup");
    }

    @Test
    @DisplayName("Successful booking returns appointment response")
    void bookAppointment_Success() {
        when(patientRepository.findById(10L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(20L)).thenReturn(Optional.of(doctor));
        when(appointmentRepository.existsOverlappingAppointment(eq(20L), any(), any(), any(), isNull()))
                .thenReturn(false);

        Appointment appointment = new Appointment(patient, doctor, request.getAppointmentDate(),
                request.getStartTime(), request.getEndTime(), "Annual checkup", null, AppointmentStatus.BOOKED);
        appointment.setId(100L);

        AppointmentResponse expectedResponse = new AppointmentResponse();
        expectedResponse.setId(100L);
        expectedResponse.setStatus(AppointmentStatus.BOOKED);

        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);
        when(mapper.toAppointmentResponse(appointment)).thenReturn(expectedResponse);

        AppointmentResponse result = appointmentService.bookAppointment(request);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    @DisplayName("Double booking rejection when doctor already has overlapping appointment")
    void bookAppointment_DoubleBooking_ThrowsConflict() {
        when(patientRepository.findById(10L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(20L)).thenReturn(Optional.of(doctor));
        when(appointmentRepository.existsOverlappingAppointment(eq(20L), any(), any(), any(), isNull()))
                .thenReturn(true);

        assertThrows(ConflictException.class, () -> appointmentService.bookAppointment(request));
        verify(appointmentRepository, never()).save(any(Appointment.class));
    }

    @Test
    @DisplayName("Past appointment rejection")
    void bookAppointment_PastDate_ThrowsBadRequest() {
        request.setAppointmentDate(LocalDate.now().minusDays(1));

        assertThrows(BadRequestException.class, () -> appointmentService.bookAppointment(request));
    }

    @Test
    @DisplayName("Inactive patient rejection")
    void bookAppointment_InactivePatient_ThrowsBadRequest() {
        patient.setActive(false);
        when(patientRepository.findById(10L)).thenReturn(Optional.of(patient));

        assertThrows(BadRequestException.class, () -> appointmentService.bookAppointment(request));
    }

    @Test
    @DisplayName("Inactive doctor rejection")
    void bookAppointment_InactiveDoctor_ThrowsBadRequest() {
        doctor.setActive(false);
        when(patientRepository.findById(10L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(20L)).thenReturn(Optional.of(doctor));

        assertThrows(BadRequestException.class, () -> appointmentService.bookAppointment(request));
    }

    @Test
    @DisplayName("Successful appointment cancellation")
    void cancelAppointment_Success() {
        Appointment appointment = new Appointment(patient, doctor, LocalDate.now().plusDays(2),
                LocalTime.of(11, 0), LocalTime.of(11, 30), "Reason", null, AppointmentStatus.BOOKED);
        appointment.setId(50L);

        when(appointmentRepository.findById(50L)).thenReturn(Optional.of(appointment));

        appointmentService.cancelAppointment(50L);

        assertEquals(AppointmentStatus.CANCELLED, appointment.getStatus());
        verify(appointmentRepository, times(1)).save(appointment);
    }
}
