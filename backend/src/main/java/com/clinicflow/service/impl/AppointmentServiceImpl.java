package com.clinicflow.service.impl;

import com.clinicflow.dto.request.AppointmentRequest;
import com.clinicflow.dto.request.RescheduleRequest;
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
import com.clinicflow.service.AppointmentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final EntityDtoMapper mapper;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository,
                                  PatientRepository patientRepository,
                                  DoctorRepository doctorRepository,
                                  EntityDtoMapper mapper) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.mapper = mapper;
    }

    /**
     * Books a new appointment with rigorous validation and concurrency-safe conflict detection:
     * 1. Booking cannot be in the past.
     * 2. Start time must precede end time.
     * 3. Patient must exist and be active.
     * 4. Doctor must exist and be active.
     * 5. Doctor must NOT have an overlapping appointment on the chosen date.
     */
    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public AppointmentResponse bookAppointment(AppointmentRequest request) {
        validateAppointmentTiming(request.getAppointmentDate(), request.getStartTime(), request.getEndTime());

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + request.getPatientId()));
        if (!patient.isActive()) {
            throw new BadRequestException("Cannot book an appointment for an inactive patient");
        }

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + request.getDoctorId()));
        if (!doctor.isActive()) {
            throw new BadRequestException("Cannot book an appointment with an inactive doctor");
        }

        // Conflict detection: Doctor schedule overlap
        boolean hasConflict = appointmentRepository.existsOverlappingAppointment(
                doctor.getId(),
                request.getAppointmentDate(),
                request.getStartTime(),
                request.getEndTime(),
                null
        );
        if (hasConflict) {
            throw new ConflictException(String.format(
                    "Doctor %s already has an active appointment overlapping between %s and %s on %s",
                    doctor.getName(), request.getStartTime(), request.getEndTime(), request.getAppointmentDate()));
        }

        Appointment appointment = new Appointment(
                patient,
                doctor,
                request.getAppointmentDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getReasonForVisit(),
                request.getNotes(),
                AppointmentStatus.BOOKED
        );

        Appointment saved = appointmentRepository.save(appointment);
        return mapper.toAppointmentResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
        return mapper.toAppointmentResponse(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getAppointments(Long doctorId, Long patientId, AppointmentStatus status,
                                                    LocalDate dateFrom, LocalDate dateTo, Pageable pageable) {
        return appointmentRepository.findFilteredAppointments(doctorId, patientId, status, dateFrom, dateTo, pageable)
                .map(mapper::toAppointmentResponse);
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public AppointmentResponse rescheduleAppointment(Long id, RescheduleRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED || appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot reschedule an appointment that is already " + appointment.getStatus());
        }

        validateAppointmentTiming(request.getAppointmentDate(), request.getStartTime(), request.getEndTime());

        boolean hasConflict = appointmentRepository.existsOverlappingAppointment(
                appointment.getDoctor().getId(),
                request.getAppointmentDate(),
                request.getStartTime(),
                request.getEndTime(),
                appointment.getId()
        );
        if (hasConflict) {
            throw new ConflictException("Doctor has another overlapping appointment at the requested rescheduled time");
        }

        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(request.getEndTime());
        appointment.setStatus(AppointmentStatus.CONFIRMED);

        Appointment saved = appointmentRepository.save(appointment);
        return mapper.toAppointmentResponse(saved);
    }

    @Override
    public AppointmentResponse updateStatus(Long id, AppointmentStatus newStatus) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));

        validateStatusTransition(appointment.getStatus(), newStatus);
        appointment.setStatus(newStatus);
        Appointment saved = appointmentRepository.save(appointment);
        return mapper.toAppointmentResponse(saved);
    }

    @Override
    public void cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Completed appointments cannot be cancelled");
        }
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByDoctorAndDate(Long doctorId, LocalDate date) {
        return appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date).stream()
                .map(mapper::toAppointmentResponse)
                .collect(Collectors.toList());
    }

    private void validateAppointmentTiming(LocalDate date, LocalTime startTime, LocalTime endTime) {
        if (date.isBefore(LocalDate.now())) {
            throw new BadRequestException("Appointment date cannot be in the past");
        }
        if (date.isEqual(LocalDate.now()) && startTime.isBefore(LocalTime.now())) {
            throw new BadRequestException("Appointment start time cannot be in the past for today");
        }
        if (!startTime.isBefore(endTime)) {
            throw new BadRequestException("Appointment start time must be strictly before end time");
        }
    }

    private void validateStatusTransition(AppointmentStatus current, AppointmentStatus target) {
        if (current == target) return;
        if (current == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Cancelled appointments cannot be updated to another status");
        }
        if (current == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Completed appointments cannot be altered");
        }
    }
}
